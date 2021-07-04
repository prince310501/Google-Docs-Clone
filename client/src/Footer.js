import React from 'react'

const Footer = () => {
    return (
      <div className="footer-basic">
        <footer>
          <div className="social">
            <a >
              <i className="icon ion-social-google"></i>
            </a>
          </div>
          <ul className="list-inline">
            <li className="list-inline-item">
              <a >Modified Google Docs © 2021</a>
            </li>
            {/* <li className="list-inline-item">
              <a href="#">Services</a>
            </li>
            <li className="list-inline-item">
              <a href="#">About</a>
            </li>
            <li className="list-inline-item">
              <a href="#">Terms</a>
            </li>
            <li className="list-inline-item">
              <a href="#">Privacy Policy</a>
            </li> */}
          </ul>
          <p className="copyright">-By Prince Shah</p>
        </footer>
      </div>
    );
}

export default Footer
