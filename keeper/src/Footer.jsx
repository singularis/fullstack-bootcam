import React from "react";

let date = new Date().getFullYear()
function Footer() {
  return (
    <footer>
        <p>@Dante {date}</p>
    </footer>
  );
}
export default Footer;
