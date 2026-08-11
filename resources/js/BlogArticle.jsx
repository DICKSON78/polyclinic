import React, { useEffect, useRef } from 'react';
import { Box, Container, Typography, Button, Chip, Stack, Divider } from '@mui/material';
import { ArrowBack as ArrowBackIcon, AccessTime as TimeIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

gsap.registerPlugin(ScrollTrigger);

const BlogArticle = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const contentRef = useRef(null);
  const heroRef = useRef(null);

  // Article data - in a real app, this would come from an API
  const articles = {
    'understanding-your-health': {
      title: 'Understanding Your Health: A Comprehensive Guide',
      category: 'Health Tips',
      date: 'March 15, 2025',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>Introduction to Good Health</h2>
        <p>Maintaining good health is crucial for overall wellbeing and quality of life. Your body is a complex system that requires proper care and attention throughout your lifetime. This comprehensive guide will help you understand common health conditions, preventive measures, and treatment options available.</p>
        
        <h2>Common Health Conditions</h2>
        <p>Several health conditions can affect people of all ages. Understanding these conditions is the first step toward prevention and early treatment:</p>
        
        <h3>Common Infections</h3>
        <p>Conditions such as malaria, typhoid, and other infections are among the most common reasons patients visit a clinic. Early diagnosis through laboratory testing allows for prompt and effective treatment.</p>
        
        <h3>Hypertension (High Blood Pressure)</h3>
        <p>High blood pressure often develops silently and can lead to serious complications affecting the heart and kidneys. Regular checkups that include blood pressure measurement are crucial for early detection.</p>
        
        <h3>Diabetes</h3>
        <p>Diabetes affects how your body uses sugar and, if unmanaged, can harm many organs. Routine blood sugar testing helps identify the condition early and manage it effectively.</p>
        
        <h2>Preventive Measures</h2>
        <p>Taking proactive steps to protect your health is essential:</p>
        <ul>
          <li><strong>Regular Checkups:</strong> Schedule health checkups every 1-2 years, or as recommended by your doctor.</li>
          <li><strong>Balanced Diet:</strong> Eat plenty of fruits, vegetables, whole grains, and lean proteins.</li>
          <li><strong>Physical Activity:</strong> Aim for at least 30 minutes of moderate exercise most days.</li>
          <li><strong>Adequate Rest:</strong> Get 7-8 hours of sleep each night to support recovery and immunity.</li>
          <li><strong>Manage Chronic Conditions:</strong> Control diabetes, hypertension, and other health conditions with your doctor's help.</li>
          <li><strong>Hydration:</strong> Drink enough water throughout the day to keep your body functioning well.</li>
        </ul>
        
        <h2>Treatment Options</h2>
        <p>Modern healthcare offers various treatment options depending on the condition:</p>
        <ul>
          <li><strong>Medications:</strong> Prescribed medicines treat infections and manage chronic conditions.</li>
          <li><strong>Laboratory Testing:</strong> Blood and urine tests guide accurate diagnosis and monitoring.</li>
          <li><strong>Imaging:</strong> X-ray and ultrasound support diagnosis of many conditions.</li>
          <li><strong>Lifestyle Changes:</strong> Diet, exercise, and stress management support recovery and prevention.</li>
        </ul>
        
        <h2>When to See a Doctor</h2>
        <p>Seek medical attention if you experience:</p>
        <ul>
          <li>Persistent fever or pain</li>
          <li>Unexplained weight loss or fatigue</li>
          <li>Difficulty breathing</li>
          <li>Severe headaches or dizziness</li>
          <li>Unusual bleeding or swelling</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Your health is one of your most valuable assets. By understanding common conditions, taking preventive measures, and seeking timely professional care, you can stay well throughout your life. Remember, early detection and treatment are key to good health.</p>
      `,
      color: '#667eea',
    },
    'importance-regular-checkups': {
      title: 'The Importance of Regular Health Checkups',
      category: 'Prevention',
      date: 'March 10, 2025',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>Why Regular Checkups Matter</h2>
        <p>Regular health checkups are one of the most important steps you can take to protect your overall health. Many conditions such as hypertension, diabetes, and anemia develop gradually and show no symptoms in their early stages. A comprehensive checkup can detect these problems before they become serious.</p>
        
        <h2>What Happens During a Checkup?</h2>
        <p>A routine health checkup involves several components:</p>
        <ul>
          <li><strong>Vital Signs:</strong> Blood pressure, temperature, pulse, and breathing rate measurement</li>
          <li><strong>Medical History Review:</strong> Discussion of your health history and any concerns</li>
          <li><strong>Physical Examination:</strong> A general assessment of your body's major systems</li>
          <li><strong>Laboratory Tests:</strong> Blood and urine tests to screen for common conditions</li>
          <li><strong>Blood Sugar Check:</strong> Screening for diabetes</li>
          <li><strong>Cholesterol Check:</strong> Assessment of your heart health risk</li>
        </ul>
        
        <h2>Early Detection Saves Lives</h2>
        <p>Many serious conditions, including hypertension, diabetes, and kidney disease, can be detected and treated early through regular checkups. Early intervention often prevents complications and improves long-term outcomes.</p>
        
        <h2>How Often Should You Have a Checkup?</h2>
        <p>The frequency of checkups depends on your age, risk factors, and overall health:</p>
        <ul>
          <li><strong>Children:</strong> Routine checkups as recommended by their pediatrician</li>
          <li><strong>Adults (18-39):</strong> Every 2-3 years if no risk factors</li>
          <li><strong>Adults (40-64):</strong> Every 1-2 years, or annually if you have risk factors</li>
          <li><strong>Adults (65+):</strong> Annually, as age increases the risk of disease</li>
        </ul>
        
        <h2>Risk Factors That Require More Frequent Checkups</h2>
        <p>You may need more frequent checkups if you have:</p>
        <ul>
          <li>Diabetes, hypertension, or a family history of these conditions</li>
          <li>A family history of heart disease or cancer</li>
          <li>High stress levels or a sedentary lifestyle</li>
          <li>Previous hospitalization for a chronic condition</li>
          <li>Certain medications that require monitoring</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Don't wait for symptoms to appear before seeing your doctor. Regular checkups are essential for maintaining good health and detecting problems early, when they are most treatable.</p>
      `,
      color: '#764ba2',
    },
    'choosing-right-doctor': {
      title: 'How to Choose the Right Doctor for Your Family',
      category: 'Health Tips',
      date: 'March 5, 2025',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>Finding the Right Doctor</h2>
        <p>Choosing the right doctor is one of the most important health decisions you can make for your family. A good doctor provides quality care, clear communication, and the confidence that your family's health is in capable hands.</p>
        
        <h2>Start with Qualifications</h2>
        <p>Always verify a doctor's credentials:</p>
        <ul>
          <li><strong>Licensing:</strong> Confirm the doctor is registered and licensed to practice</li>
          <li><strong>Specialization:</strong> Check whether the doctor's specialty matches your needs</li>
          <li><strong>Experience:</strong> Ask about experience with conditions similar to yours</li>
          <li><strong>Facility:</strong> Verify the clinic or hospital where the doctor practices</li>
        </ul>
        
        <h2>Consider Communication Style</h2>
        <p>Good communication is essential for effective treatment:</p>
        <ul>
          <li>Does the doctor listen carefully to your concerns?</li>
          <li>Are explanations clear and easy to understand?</li>
          <li>Is the doctor willing to answer your questions?</li>
          <li>Does the doctor involve you in treatment decisions?</li>
        </ul>
        
        <h2>Think About Accessibility</h2>
        <p>Practical factors matter for ongoing care:</p>
        <ul>
          <li>Location and travel time to the clinic</li>
          <li>Availability of appointments that fit your schedule</li>
          <li>How quickly you can get urgent care</li>
          <li>Whether the doctor offers follow-up and telemedicine options</li>
        </ul>
        
        <h2>Check the Facility</h2>
        <p>The facility where your doctor practices should offer:</p>
        <ul>
          <li><strong>On-site Laboratory:</strong> Fast and accurate diagnostic testing</li>
          <li><strong>Pharmacy:</strong> Convenient access to prescribed medicines</li>
          <li><strong>Imaging Services:</strong> X-ray and ultrasound when needed</li>
          <li><strong>Emergency Support:</strong> Clear processes for after-hours concerns</li>
        </ul>
        
        <h2>Ask for Recommendations</h2>
        <p>Word of mouth is valuable. Ask trusted family members, friends, and colleagues about their experiences. You can also visit the clinic beforehand to get a sense of the environment and how staff treat patients.</p>
        
        <h2>Conclusion</h2>
        <p>Take time to research and choose a doctor you trust. A strong patient-doctor relationship leads to better communication, earlier detection of problems, and better overall health outcomes for your whole family.</p>
      `,
      color: '#f093fb',
    },
    'managing-stress': {
      title: 'Managing Stress for a Healthier Lifestyle',
      category: 'Wellness',
      date: 'February 28, 2025',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>Understanding Stress</h2>
        <p>Stress is the body's natural response to pressure, and a little of it can help you stay alert and focused. But when stress becomes constant, it affects both your physical and mental health. Understanding how stress works is the first step toward managing it.</p>
        
        <h2>Common Symptoms</h2>
        <ul>
          <li>Headaches and muscle tension</li>
          <li>Fatigue and difficulty sleeping</li>
          <li>Irritability and mood changes</li>
          <li>Poor concentration</li>
          <li>Elevated blood pressure</li>
          <li>Changes in appetite</li>
        </ul>
        
        <h2>The Impact of Chronic Stress</h2>
        <p>Long-term stress can contribute to serious health problems, including hypertension, heart disease, digestive issues, and a weakened immune system. Managing stress is not a luxury — it is essential for your health.</p>
        
        <h2>Breathing and Relaxation</h2>
        <p>Simple techniques can help calm your body:</p>
        <ul>
          <li><strong>Deep Breathing:</strong> Breathe in slowly through your nose, hold briefly, then exhale slowly. Repeat several times.</li>
          <li><strong>Progressive Relaxation:</strong> Tense and then relax each muscle group, starting from your feet upward.</li>
          <li><strong>Mindful Moments:</strong> Take a few minutes daily to focus on the present and let go of racing thoughts.</li>
        </ul>
        
        <h2>Healthy Habits That Reduce Stress</h2>
        <ul>
          <li><strong>Regular Exercise:</strong> Even a 30-minute walk releases chemicals that improve your mood.</li>
          <li><strong>Balanced Diet:</strong> Avoid excess caffeine and sugar; eat regular, nutritious meals.</li>
          <li><strong>Good Sleep:</strong> Aim for 7-8 hours to help your body recover.</li>
          <li><strong>Social Support:</strong> Talk to family and friends about what is troubling you.</li>
        </ul>
        
        <h2>When to Seek Help</h2>
        <p>If stress feels overwhelming or persistent, speak with a healthcare professional. Ongoing anxiety, depression, or physical symptoms deserve proper attention, and your doctor can recommend counseling or other support.</p>
      `,
      color: '#4facfe',
    },
    'nutrition-healthy-living': {
      title: 'Nutrition for a Healthy Life',
      category: 'Nutrition',
      date: 'February 22, 2025',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>Foods for a Healthy Body</h2>
        <p>What you eat significantly impacts your overall health. A balanced diet can help prevent chronic diseases, maintain a healthy weight, and keep your body strong throughout your life.</p>
        
        <h2>Essential Vitamins and Nutrients</h2>
        <h3>Vitamin A</h3>
        <p>Essential for good vision, immunity, and healthy skin. Found in carrots, sweet potatoes, spinach, and dairy products.</p>
        
        <h3>Vitamin C</h3>
        <p>An antioxidant that supports immunity and helps the body heal. Abundant in citrus fruits, berries, and bell peppers.</p>
        
        <h3>Vitamin D</h3>
        <p>Important for strong bones and a healthy immune system. Found in fortified foods and produced by the body through sunlight.</p>
        
        <h3>Iron</h3>
        <p>Carries oxygen in the blood and prevents anemia. Found in red meat, beans, lentils, and dark leafy greens.</p>
        
        <h3>Omega-3 Fatty Acids</h3>
        <p>Support heart and brain health. Found in fatty fish, flaxseeds, and walnuts.</p>
        
        <h3>Calcium</h3>
        <p>Builds and maintains strong bones and teeth. Found in milk, yogurt, cheese, and leafy greens.</p>
        
        <h2>Healthy Foods to Include</h2>
        <ul>
          <li><strong>Leafy Greens:</strong> Spinach, kale, and collard greens are rich in iron and vitamins</li>
          <li><strong>Fish:</strong> Salmon, tuna, and sardines provide omega-3 fatty acids</li>
          <li><strong>Whole Grains:</strong> Oats, brown rice, and whole wheat provide sustained energy</li>
          <li><strong>Fruits:</strong> Oranges, bananas, and berries are high in vitamins and fiber</li>
          <li><strong>Legumes:</strong> Beans and lentils provide protein and iron</li>
          <li><strong>Root Vegetables:</strong> Sweet potatoes and carrots are rich in vitamin A</li>
        </ul>
        
        <h2>Dietary Recommendations</h2>
        <p>Aim for a balanced diet that includes:</p>
        <ul>
          <li>At least 5 servings of fruits and vegetables daily</li>
          <li>Fish at least twice a week</li>
          <li>Whole grains instead of refined carbohydrates</li>
          <li>Limited processed foods, salt, and added sugars</li>
          <li>Adequate protein from fish, poultry, legumes, or beans</li>
        </ul>
        
        <h2>Hydration Matters</h2>
        <p>Staying hydrated supports every system in your body. Aim for about 8 glasses of water daily, and more in hot weather or during physical activity.</p>
        
        <h2>Conclusion</h2>
        <p>Incorporating healthy foods into your diet is a simple yet effective way to protect your health. Combine good nutrition with regular checkups for the best possible wellbeing.</p>
      `,
      color: '#43e97b',
    },
    'understanding-hypertension': {
      title: 'Understanding Hypertension: The Silent Risk',
      category: 'Medical',
      date: 'February 18, 2025',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      content: `
        <h2>What is Hypertension?</h2>
        <p>Hypertension, or high blood pressure, occurs when the force of blood against your artery walls is consistently too high. It is often called the "silent killer" because it usually has no symptoms, yet it is a leading risk factor for heart disease, stroke, and kidney damage. Regular measurement is the only way to know your blood pressure.</p>
        
        <h2>Types of Hypertension</h2>
        <h3>Primary Hypertension</h3>
        <p>The most common type, developing gradually over many years. It has no single identifiable cause and is influenced by age, lifestyle, and heredity.</p>
        
        <h3>Secondary Hypertension</h3>
        <p>Caused by an underlying condition such as kidney disease, hormonal disorders, or certain medications. Treating the cause often brings blood pressure back to normal.</p>
        
        <h2>Risk Factors</h2>
        <ul>
          <li>Age over 40</li>
          <li>Family history of hypertension</li>
          <li>Excess salt and unhealthy diet</li>
          <li>Being overweight or physically inactive</li>
          <li>Excessive alcohol or tobacco use</li>
          <li>Chronic stress</li>
          <li>Certain medical conditions (diabetes, kidney disease)</li>
        </ul>
        
        <h2>Symptoms</h2>
        <p>Hypertension rarely causes symptoms, even at high levels. In severe cases, you may experience:</p>
        <ul>
          <li>Headaches</li>
          <li>Dizziness</li>
          <li>Blurred vision</li>
          <li>Chest pain</li>
          <li>Shortness of breath</li>
          <li>Nosebleeds</li>
        </ul>
        
        <h2>Diagnosis</h2>
        <p>Blood pressure is measured with a simple test. It is classified as high when readings are consistently at or above 130/80 mmHg. Your doctor may also recommend:</p>
        <ul>
          <li>Urine and blood tests</li>
          <li>Electrocardiogram (ECG)</li>
          <li>Repeated readings over several visits</li>
        </ul>
        
        <h2>Treatment Options</h2>
        <h3>Lifestyle Changes</h3>
        <p>Reducing salt, eating a balanced diet, exercising regularly, losing weight, quitting tobacco, and limiting alcohol can lower blood pressure significantly.</p>
        
        <h3>Medications</h3>
        <p>Various classes of blood pressure medicines are available. Your doctor will tailor treatment to your needs, and regular checkups ensure the treatment stays effective.</p>
        
        <h2>Prevention and Early Detection</h2>
        <p>Since hypertension often has no symptoms, regular blood pressure checks are crucial. Early detection and treatment prevent complications such as heart attack, stroke, and kidney failure.</p>
        
        <h2>Living with Hypertension</h2>
        <p>With proper treatment and monitoring, most people with hypertension lead full, healthy lives. Consistent medication, regular follow-up appointments, and a healthy lifestyle are the keys to managing the condition.</p>
        
        <h2>Conclusion</h2>
        <p>Hypertension is serious but manageable. Don't wait for symptoms — schedule regular checkups, especially if you have risk factors. Know your numbers, and let your doctor guide your care.</p>
      `,
      color: '#fa709a',
    },
  };

  const article = articles[slug] || articles['understanding-your-health'];

  useEffect(() => {
    if (heroRef.current) {
      gsap.from(heroRef.current.children, {
        duration: 1,
        y: 30,
        opacity: 0,
        stagger: 0.2,
        ease: 'power3.out',
      });
    }

    if (contentRef.current) {
      gsap.from(contentRef.current.children, {
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top 80%',
        },
        duration: 0.8,
        y: 40,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }

    return () => {
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
    };
  }, [slug]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFAF8', position: 'relative' }}>
      <Navbar />
      
      {/* Hero Section */}
      <Box
        ref={heroRef}
        sx={{
          background: `linear-gradient(135deg, ${article.color} 0%, ${article.color}dd 100%)`,
          color: 'white',
          py: { xs: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/blog')}
            sx={{
              color: 'white',
              mb: 3,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            Back to Blog
          </Button>
          
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label={article.category}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
            <Chip
              icon={<TimeIcon sx={{ fontSize: '0.9rem !important', color: 'white' }} />}
              label={article.readTime}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
            <Chip
              icon={<CalendarIcon sx={{ fontSize: '0.9rem !important', color: 'white' }} />}
              label={article.date}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Stack>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
              fontWeight: 900,
              mb: 3,
              lineHeight: 1.2,
            }}
          >
            {article.title}
          </Typography>
        </Container>
      </Box>

      {/* Article Image */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 300, md: 500 },
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={article.image}
          alt={article.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>

      {/* Article Content */}
      <Box
        ref={contentRef}
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: '#FAFAF8',
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              bgcolor: 'white',
              p: { xs: 4, md: 6 },
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              '& h2': {
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#1C1C1C',
                mt: 4,
                mb: 2,
                '&:first-of-type': {
                  mt: 0,
                },
              },
              '& h3': {
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#1C1C1C',
                mt: 3,
                mb: 1.5,
              },
              '& p': {
                fontSize: '1rem',
                lineHeight: 1.8,
                color: '#4A4A4A',
                mb: 2,
              },
              '& ul': {
                mb: 2,
                pl: 3,
                '& li': {
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  color: '#4A4A4A',
                  mb: 1,
                  '& strong': {
                    fontWeight: 600,
                    color: '#1C1C1C',
                  },
                },
              },
            }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default BlogArticle;

