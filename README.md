# Leaflet - Invoice Maker 📄🌿

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![Platform: GitHub Pages](https://img.shields.io/badge/Platform-GitHub_Pages-black?style=for-the-badge&logo=github)

Leaflet is a beautiful, responsive, fully client-side invoice generator built with Vanilla JavaScript, HTML5, and CSS3. It allows freelancers, contractors, and small business owners to quickly generate professional, high-quality A4 PDF invoices directly from their browser, without the need for a backend or user accounts.

## ✨ Features

- 📱 **Mobile-First Design:** Fully responsive interface. On mobile, it features a sleek floating action button to toggle a glassmorphism live preview overlay.
- 📄 **High-Quality PDF Generation:** Exports perfectly scaled, single-page A4 PDFs using `html2canvas` and `jsPDF`.
- 💾 **Local Storage Persistence:** Automatically saves your company details, payment methods, and footer information to your browser so you don't have to re-type them.
- 💡 **Smart Item History:** Remembers past invoice items and prices, offering intelligent autocomplete suggestions as you type.
- 💱 **Quick Currency Toggle:** Instantly switch between multiple currencies ($, ৳, €, £) with a single click.
- 🧮 **Automatic Calculations:** Seamlessly handles line totals, tax rates, discount amounts, and grand totals in real-time.
- 🎨 **Modern Aesthetics:** Clean, premium UI utilizing modern SVG icons and beautiful typography (`Playfair Display`, `Montserrat`, and `Dancing Script` for authentic-looking signatures).

## 🚀 Getting Started

Since Leaflet is entirely client-side, there is no complicated setup or build process required. 

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mogdho/leaflet.git
   ```
2. **Open the app:**
   Simply open `index.html` in any modern web browser.
3. **Start creating:**
   Fill out your invoice details, add your items, and click **Download PDF** when you're ready!

## 🛠️ Technology Stack

- **HTML5 & CSS3:** For structure and a highly responsive, modern layout.
- **Vanilla JavaScript:** For all state management, real-time calculations, and DOM manipulation.
- **[html2canvas](https://html2canvas.hertzen.com/):** Used to capture the DOM structure and render it to a canvas.
- **[jsPDF](https://github.com/parallax/jsPDF):** Used to convert the rendered canvas into a downloadable A4 PDF document.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/mogdho/leaflet/issues).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Tags:* `invoice-generator` `pdf-generation` `vanilla-javascript` `localstorage` `responsive-design` `html2canvas` `jspdf` `frontend` `productivity-tool` `web-app`
