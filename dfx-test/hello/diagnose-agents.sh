#!/bin/bash
#
#================================================================
# Script to collect basic agent information from a VM.
#================================================================
#
# Version: 0.1
# Date   : 2022-01-24 (last updated date)
#
#----------------------------------------------------------------
# Usage
#----------------------------------------------------------------
#
# Inputs (as environment variables):
#   OUTPUT_DIR: (Optional) Where to store output. Must not already exist.
#
# Usage:
#   [OUTPUT_DIR=<path>] bash diagnose-agents.sh

# Collects:
#   Project ID and name
#   VM ID and name
#   VM distro and version
#   Installed agent type
#   Installed agent version
#   Agent service status
#   Agent configuration
#   Agent logs

VERSION="0.1"

OUTPUT_DIR="${OUTPUT_DIR:-"/var/tmp/google-agents/$(date +"%Y%m%d")"}"

fail() {
  echo >&2 "[$(date +'%Y-%m-%dT%H:%M:%S%z')] $*"
  exit 1
}

# Create output directory. If directory already exists, appends unique number.
# For example, 3 successive runs on same day would result in the following dirs:
#   - /var/tmp/google-agents/20220101
#   - /var/tmp/google-agents/20220101-1
#   - /var/tmp/google-agents/20220101-2
create_output_dir() {
  if [[ -e $OUTPUT_DIR ]] ; then
    echo "$OUTPUT_DIR already exists. Creating new directory."
    i=1
    while [[ -e $OUTPUT_DIR-$i ]] ; do
      let i++
    done
    OUTPUT_DIR=$OUTPUT_DIR-$i
  fi
  mkdir -p "$OUTPUT_DIR"
  echo "OUTPUT DIRECTORY: $OUTPUT_DIR"

  SUMMARY_PATH="$OUTPUT_DIR/agent-info.txt"
}

# Takes single arg of package name
# Agent packages: google-fluentd, stackdriver-agent, google-cloud-ops-agent
is_installed() {
  if "$IS_DEB"; then
    dpkg-query --list "$1" | grep -q "^ii" 2>/dev/null
  else
    rpm --quiet -q "$1"
  fi
  return $?
}

# Takes any number of args of package names
get_version() {
  if "$IS_DEB"; then
    dpkg-query --show --showformat '${Package} ${Version} ${Architecture} ${Status}\n' "$@"
  else
    rpm --query --queryformat '%{NAME} %{VERSION} %{RELEASE} %{ARCH}\n' "$@"
  fi
}

#----------------------------------------------------------------
# Metadata
#----------------------------------------------------------------

METADATA_URL='http://metadata.google.internal/computeMetadata/v1'

get_metadata() {
  curl -f -s "$METADATA_URL/$1" -H 'Metadata-Flavor: Google'
}

ZONE=$(get_metadata 'instance/zone') # projects/25462099632/zones/us-central1-c
ZONE="${ZONE##*/}"                   # us-central1-c

PROJECT_ID=$(get_metadata 'project/numeric-project-id')
PROJECT_NAME=$(get_metadata 'project/project-id')

INSTANCE_ID=$(get_metadata 'instance/id')
INSTANCE_NAME=$(get_metadata 'instance/name')

IMAGE=$(get_metadata 'instance/image')       # projects/centos-cloud/global/images/centos-7-v20210916
IMAGE_PROJECT=$(echo "$IMAGE" | cut -d/ -f2) # centos-cloud

write_metadata() {
  echo -e "Script version $VERSION run at $(date)\n" >> "$SUMMARY_PATH"

  cat >> "$SUMMARY_PATH" << EOF
===============================================================================
METADATA
===============================================================================
zone: $ZONE
project_name: $PROJECT_NAME
project_id: $PROJECT_ID
instance_name: $INSTANCE_NAME
instance_id: $INSTANCE_ID
image: $IMAGE

EOF
}

#----------------------------------------------------------------
# GoogleAPIs Connectivity
#----------------------------------------------------------------

# Takes single arg of URL
check_connection_for_url() {
  echo -n "Trying to connect to $1 ... " >> "$SUMMARY_PATH"
  curl --silent --fail --connect-timeout 5 "https://$1" -o /dev/null
  case $? in
          0) echo "Connected OK" >> "$SUMMARY_PATH" ;;
          6) echo "Failed to resolve" >> "$SUMMARY_PATH" ;;
          7) echo "Failed to connect" >> "$SUMMARY_PATH" && # Potentially firewall issue.
             echo "- Could not connect to $1. If this is unexpected, ensure the VM is "`
                  `"allowed access via either an assigned external IP or Private Google Access "`
                  `"(see https://cloud.google.com/vpc/docs/private-access-options)." >&2;;
          *) echo "Failed: $?" >> "$SUMMARY_PATH" ;;
  esac
}

check_connectivity() {
  echo -e "\nChecking connectivity to Google APIs"
  check_connection_for_url "googleapis.com"
  check_connection_for_url "logging.googleapis.com"
  check_connection_for_url "monitoring.googleapis.com"
}

#----------------------------------------------------------------
# Logging Agent
#----------------------------------------------------------------

check_logging_agent() {
  LOGGING_AGENT_LOGS_DIR="/var/log/google-fluentd"
  LOGGING_AGENT_CONFIGS_DIR="/etc/google-fluentd"

  cat >> "$SUMMARY_PATH" << EOF
===============================================================================
LOGGING AGENT
===============================================================================
EOF

  echo -e "\nChecking legacy Logging Agent (Ops Agent is preferred)"
  if ! is_installed google-fluentd; then
    echo "- Logging Agent is not installed."
    echo -e "NOT INSTALLED\n">> "$SUMMARY_PATH"
    return;
  fi

  mkdir -p "$OUTPUT_DIR/google-fluentd"

  cat >> "$SUMMARY_PATH" << EOF
===== VERSION =====
$(get_version \
    google-fluentd \
    google-fluentd-catch-all-config \
    google-fluentd-catch-all-config-structured)

===== STATUS =====
$(sudo service google-fluentd status)

===== METRICS =====
$(curl --silent localhost:24231/metrics)

EOF

  echo "- Copying logs from $LOGGING_AGENT_LOGS_DIR"
  sudo tar -czf "$OUTPUT_DIR/google-fluentd/google-fluentd-logs.tar.gz" -C $LOGGING_AGENT_LOGS_DIR .
  echo "- Copying configs from $LOGGING_AGENT_CONFIGS_DIR"
  sudo tar -czf "$OUTPUT_DIR/google-fluentd/google-fluentd-configs.tar.gz" -C $LOGGING_AGENT_CONFIGS_DIR .
}

#----------------------------------------------------------------
# Monitoring Agent
#----------------------------------------------------------------

check_monitoring_agent() {
  MONITORING_AGENT_CONFIGS_DIR="/etc/stackdriver"

  cat >> "$SUMMARY_PATH" << EOF
===============================================================================
MONITORING AGENT
===============================================================================
EOF

  echo -e "\nChecking legacy Monitoring Agent (Ops Agent is preferred)"
  if ! is_installed stackdriver-agent; then
    echo "- Monitoring Agent is not installed."
    echo -e "NOT INSTALLED\n" >> "$SUMMARY_PATH"
    return;
  fi

  mkdir -p "$OUTPUT_DIR/stackdriver-agent"

  cat >> "$SUMMARY_PATH" << EOF
===== VERSION =====
$(get_version stackdriver-agent)

===== STATUS =====
$(sudo service stackdriver-agent status)

EOF

  echo "- Copying Monitoring Agent logs"
  sudo grep -s collectd /var/log/{syslog,messages} > "$OUTPUT_DIR/stackdriver-agent/collectd.logs"
  echo "- Copying configs from $MONITORING_AGENT_CONFIGS_DIR"
  sudo cp -r $MONITORING_AGENT_CONFIGS_DIR "$OUTPUT_DIR/stackdriver-agent/conf"
}

#----------------------------------------------------------------
# Ops Agent
#----------------------------------------------------------------

check_ops_agent() {
  OPS_AGENT_LOGS_DIR="/var/log/google-cloud-ops-agent/subagents"
  OPS_AGENT_CONFIG="/etc/google-cloud-ops-agent/config.yaml"

  cat >> "$SUMMARY_PATH" << EOF
===============================================================================
OPS AGENT
===============================================================================
EOF

  echo -e "\nChecking Ops Agent"
  if ! is_installed google-cloud-ops-agent; then
    echo "- Ops Agent is not installed."
    echo -e "NOT INSTALLED\n">> "$SUMMARY_PATH"
    return;
  fi

  mkdir -p "$OUTPUT_DIR/google-cloud-ops-agent"

  cat >> "$SUMMARY_PATH" << EOF
===== VERSION =====
$(get_version google-cloud-ops-agent)

===== STATUS =====
$(sudo systemctl status google-cloud-ops-agent*)

===== FLUENT BIT METRICS =====
$(curl --silent 0.0.0.0:2020/api/v1/uptime)
--------------------------------------------------------------------------------
$(curl --silent 0.0.0.0:2020/api/v1/metrics)
--------------------------------------------------------------------------------
$(curl --silent 0.0.0.0:2020/api/v1/storage)

EOF

  echo "- Copying subagent logs from $OPS_AGENT_LOGS_DIR"
  sudo cp -r $OPS_AGENT_LOGS_DIR "$OUTPUT_DIR/google-cloud-ops-agent"
  echo "- Copying Ops Agent system logs"
  sudo grep -E -s "google_cloud_ops_agent_engine|otelopscol|fluent-bit|google-cloud-ops" /var/log/{syslog,messages} > "$OUTPUT_DIR/google-cloud-ops-agent/oa-system.logs"
  echo "- Copying config from $OPS_AGENT_CONFIG"
  cp "$OPS_AGENT_CONFIG" "$OUTPUT_DIR/google-cloud-ops-agent"

  # TODO(jschulz): record size of various folders (buffers and logs for OA and subagents)
}

#----------------------------------------------------------------

main() {
  if [[ "$IMAGE_PROJECT" =~ ^(debian|ubuntu|ubuntu-os)-cloud$ ]]; then
    IS_DEB=true
  elif [[ "$IMAGE_PROJECT" =~ ^(centos|rhel|suse)-cloud$ ]]; then
    IS_DEB=false
  else
    fail "Unidentifiable or unsupported platform."
  fi

  cat <<EOF
--------------------------------------------------------------------
Starting agent diagnostic script. This script will gather information
about your VM and any Google Cloud Agents running on it. All output will
be found in the directory printed below. Please redact any sensitive
information from the copied configs and logs before sending to Support.
--------------------------------------------------------------------
EOF

  create_output_dir
  write_metadata
  check_connectivity
  check_ops_agent
  check_logging_agent
  check_monitoring_agent
}

main
