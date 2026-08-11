import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component for dynamic page titles and meta tags
 * Usage: <SEO title="Page Title" description="Page description" />
 */
const SEO = ({ 
  title = 'Polyclinic HMS - Hospital Management System',
  description = 'Polyclinic HMS is a comprehensive hospital management system for polyclinics and healthcare facilities. We offer patient registration, triage, consultations, laboratory services, pharmacy, inpatient care, and more.',
  keywords = 'polyclinic, hospital management system, clinic software, patient management, electronic medical records, triage, laboratory, pharmacy, Polyclinic HMS',
  image = '/logo.png',
  type = 'website',
  noindex = false,
}) => {
  const location = useLocation();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://polyclinic-hms.com';
  const fullUrl = `${baseUrl}${location.pathname}`;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name, content, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Primary Meta Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    updateMetaTag('author', 'Polyclinic HMS');
    updateMetaTag('language', 'English');
    updateMetaTag('revisit-after', '7 days');
    updateMetaTag('theme-color', '#667eea');

    // Open Graph Tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:url', fullUrl, 'property');
    updateMetaTag('og:image', imageUrl, 'property');
    updateMetaTag('og:image:width', '1200', 'property');
    updateMetaTag('og:image:height', '630', 'property');
    updateMetaTag('og:site_name', 'Polyclinic HMS', 'property');
    updateMetaTag('og:locale', 'en_US', 'property');

    // Twitter Card Tags - MUST use 'name' attribute, not 'property'
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:url', fullUrl, 'name');
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', imageUrl, 'name');

    // Geo Tags
    updateMetaTag('geo.region', 'TZ-26');
    updateMetaTag('geo.placename', 'Dar es Salaam');
    updateMetaTag('geo.position', '-6.7924;39.2083');
    updateMetaTag('ICBM', '-6.7924, 39.2083');

    // Business Information
    updateMetaTag('contact', 'info@polyclinic-hms.com');
    updateMetaTag('phone', '+255 676 506 323');
    updateMetaTag('address', 'Dar es Salaam, Tanzania');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Structured Data (JSON-LD) for LocalBusiness
    let structuredDataScript = document.getElementById('structured-data');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.id = 'structured-data';
      structuredDataScript.type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': fullUrl,
      name: 'Polyclinic HMS',
      description: description,
      url: baseUrl,
      telephone: '+255676506323',
      email: 'info@polyclinic-hms.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Dar es Salaam, Tanzania',
        addressLocality: 'Dar es Salaam',
        addressCountry: 'TZ',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '-6.7924',
        longitude: '39.2083',
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '17:00',
      },
      image: imageUrl,
      priceRange: '$$',
      areaServed: {
        '@type': 'City',
        name: 'Dar es Salaam',
      },
      service: [
        'Outpatient Care',
        'Inpatient Care',
        'Laboratory Services',
        'Pharmacy & Dispensing',
        'Radiology & Imaging',
      ],
    };

    structuredDataScript.textContent = JSON.stringify(structuredData);

  }, [title, description, keywords, image, type, noindex, fullUrl, baseUrl, imageUrl]);

  return null;
};

export default SEO;

