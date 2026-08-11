<nav class="navbar">
  <div class="navbar-container">
    <a href="/" class="logo">
      <img src="/logo.png" alt="Polyclinic HMS" height="50">
    </a>
    <ul class="navbar-menu">
      <li><a href="/">Home</a></li>
      <li class="dropdown">
        <a href="/features">Features</a>
        <ul class="dropdown-menu">
          <li><a href="/features#patient-management">Patient Management</a></li>
          <li><a href="/features#clinical-tools">Clinical Tools</a></li>
        </ul>
      </li>
      <li><a href="/solutions">Solutions</a></li>
      <li><a href="/pricing">Pricing</a></li>
      <li><a href="/case-studies">Case Studies</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
      <li><a href="/appointment">Appointment</a></li>
    </ul>
  </div>
</nav>
<style>
  .navbar {
    background-image: radial-gradient(circle, #0093E9, #80D0C7);
    padding: 20px 40px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    border-bottom: 5px solid #0070f3;
    transition: transform 0.4s ease;
    transform: scale(1);
  }

  .navbar:hover {
    transform: scale(1.05);
  }

  .navbar-menu li a {
    color: #f0f4f8;
    font-weight: bold;
    padding: 10px 20px;
    border-radius: 10px;
    background-color: transparent;
    transition: background-color 0.4s, transform 0.4s;
  }

  .navbar-menu li a:hover {
    color: #fff;
    background-color: #017cff;
    transform: translateY(-5px);
  }

  .navbar-menu .dropdown-menu {
    background-color: #e3f2fd;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    transition: all 0.4s ease-in-out;
    opacity: 0;
    transform: translateY(-15px);
    visibility: hidden;
  }

  .navbar-menu .dropdown:hover .dropdown-menu {
    display: block;
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
  }

  .navbar-menu .dropdown-menu li a:hover {
    background-color: #d1e7ff;
  }

  .navbar-container {
    max-width: 1300px;
    margin: 0 auto;
    padding: 0 30px;
  }

  /* Responsive styles for tablets and mobile */
  @media (max-width: 1199px) {
    .navbar {
      padding: 15px 20px;
    }

    .navbar-container {
      padding: 0 20px;
    }

    .navbar-menu {
      display: none; /* Hide menu on tablets, show hamburger instead */
    }
  }

  @media (max-width: 768px) {
    .navbar {
      padding: 12px 15px;
    }

    .navbar-container {
      flex-direction: column;
      align-items: flex-start;
      padding: 0 15px;
    }

    .navbar-menu {
      flex-direction: column;
      gap: 15px;
      width: 100%;
      margin-top: 15px;
    }
  }
</style>
