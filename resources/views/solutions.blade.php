<head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
  <style>
    .solution-grid {
      clip-path: polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%);
      background: linear-gradient(135deg, #059669, #0ea5e9);
      padding: 60px 0;
    }
    .solution-section {
      margin: 20px;
      border-radius: 15px;
      box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .solution-section:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 20px rgba(0, 0, 0, 0.2);
    }
    .solution-section img {
      display: block;
      max-width: 100%;
      border-radius: 15px 15px 0 0;
    }
  </style>
</head>
<body>
  @include('navbar')
  <!-- Solutions Grid -->
  <section class="solutions">
    <div class="solutions-container">
      <div class="solutions-header">
        <h1>Our Comprehensive Solutions</h1>
        <p>At Polyclinic HMS, we tailor solutions to meet the unique needs of healthcare facilities.</p>
      </div>
      <div class="solutions-content">
        <h2>Advanced Patient Care</h2>
        <p>Our tools enhance scheduling, data accuracy, and patient engagement, ensuring a seamless experience from start to finish.</p>
        <h2>Operation Management</h2>
        <p>Streamline clinic operations with real-time analytics and efficient task management.</p>
        <h2>Data Integration and Security</h2>
        <p>Secure data encryption and smooth integration with existing systems to safeguard patient information.</p>
      </div>
      <div class="solutions-graphics">
        <img src="/images/solutions-graphic.png" alt="Solutions Graphic">
      </div>
      <div class="solutions-stories">
        <h2>Success Stories</h2>
        <div class="story">
          <h3>Leading Clinic in NYC</h3>
          <p>"Maboresho's solutions have revolutionized our practice, increasing operational efficiency by 30%." - Clinic Administrator</p>
        </div>
        <!-- More stories can be added here -->
      </div>
      <div class="solutions-cta">
        <button onclick="window.location.href='/contact'">Discover More</button>
      </div>
    </div>
  </section>

  <style>
    .solutions {
      background-color: #f9fafb;
      padding: 60px 20px;
    }

    .solutions-container {
      max-width: 900px;
      margin: 0 auto;
      text-align: left;
    }

    .solutions-header h1 {
      font-size: 2.6em;
      color: #1e3a8a;
      margin-bottom: 20px;
    }

    .solutions-header p {
      font-size: 1.3em;
      color: #555;
      margin-bottom: 40px;
    }

    .solutions-content h2 {
      font-size: 2em;
      color: #1e3a8a;
      margin: 30px 0 10px;
    }

    .solutions-content p {
      font-size: 1.1em;
      line-height: 1.6;
      color: #333;
      margin: 20px 0;
    }

    .solutions-graphics img {
      width: 100%;
      margin: 40px 0;
    }

    .solutions-stories {
      background-color: #e3f2fd;
      padding: 30px;
      margin: 40px 0;
    }

    .story h3 {
      font-size: 1.5em;
      color: #1e3a8a;
      margin-bottom: 10px;
    }

    .story p {
      font-size: 1.1em;
      color: #555;
    }

    .solutions-cta {
      text-align: center;
      margin: 50px 0;
    }

    .solutions-cta button {
      background-color: #1e40af;
      color: #fff;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease-in-out;
    }

    .solutions-cta button:hover {
      background-color: #1e3a8a;
    }
  </style>
  <!-- GSAP Animations -->
  <script>
    gsap.from(".solution-section", {
      scrollTrigger: {
        trigger: ".solution-section",
        start: "top 75%",
        end: "bottom 25%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 50,
      duration: 1
    });
  </script>
  @include('footer')
</body>
