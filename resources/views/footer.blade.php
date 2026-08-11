<footer class="footer">
  <div class="footer-container">
    <div class="footer-info">
      <h4>About Us</h4>
      <p>Polyclinic HMS is dedicated to providing comprehensive hospital management solutions for healthcare facilities.</p>
      <p>&copy; 2025 Polyclinic HMS. All rights reserved.</p>
      <div class="footer-links">
        <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a>
      </div>
    </div>
    <div class="footer-contact">
      <h4>Contact Us</h4>
      <p>Contact us: info@maboresho.com | Phone: (123) 456-7890</p>
      <div class="social-media">
        <a href="#"><img src="/images/social-facebook.png" alt="Facebook"></a>
        <a href="#"><img src="/images/social-twitter.png" alt="Twitter"></a>
        <a href="#"><img src="/images/social-linkedin.png" alt="LinkedIn"></a>
      </div>
    </div>
    <div class="footer-subscribe">
      <h4>Subscribe to Our Newsletter</h4>
      <form class="subscribe-form">
        <input type="email" placeholder="Enter your email" required>
        <button type="submit">Subscribe</button>
      </form>
    </div>
  </div>
</footer>

<style>
  .footer {
    background-color: #1e40af;
    color: white;
    padding: 40px 50px;
    position: relative;
  }

  .footer-container {
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .footer-info, .footer-contact, .footer-subscribe {
    flex: 1 1 200px;
    margin: 15px;
  }

  .footer-info h4, .footer-contact h4, .footer-subscribe h4 {
    margin: 0 0 10px 0;
    font-size: 1.5em;
  }

  .footer-links, .social-media {
    display: flex;
    gap: 15px;
  }

  .social-media img {
    height: 35px;
    transition: transform 0.3s ease-in-out;
  }

  .social-media img:hover {
    transform: scale(1.2);
  }

  .subscribe-form {
    display: flex;
    gap: 10px;
  }

  .subscribe-form input {
    flex: 1;
    padding: 8px;
    border-radius: 5px;
    border: none;
  }

  .subscribe-form button {
    padding: 8px 15px;
    border-radius: 5px;
    border: none;
    background-color: white;
    color: #1e40af;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
  }

  .subscribe-form button:hover {
    background-color: #f9fafb;
    color: #1e3a8a;
  }
</style>
