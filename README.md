# Umair Maqsood - Portfolio Website

A modern, responsive portfolio website showcasing the work and skills of Umair Maqsood - Developer & AI Explorer.

## 🌟 Features

- **Modern Dark Theme** - Sleek dark design with gradient accents
- **Fully Responsive** - Optimized for all devices and screen sizes
- **Smooth Animations** - AOS (Animate On Scroll) library integration
- **Interactive Elements** - Hover effects, smooth scrolling, and dynamic content
- **Contact Form** - Functional contact form with validation
- **Loading Screen** - Elegant loading animation
- **Scroll to Top** - Smooth scroll-to-top functionality
- **Mobile Navigation** - Hamburger menu for mobile devices

## 🚀 Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid, Flexbox, and custom properties
- **JavaScript (ES6+)** - Interactive functionality and animations
- **AOS Library** - Scroll-triggered animations
- **Font Awesome** - Icons
- **Google Fonts** - Inter font family

## 📁 Project Structure

```
portfolio/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
├── README.md           # Project documentation
└── CNAME              # Custom domain configuration
```

## 🎨 Design Features

### Color Scheme
- **Primary**: #00d4ff (Cyan)
- **Secondary**: #7c3aed (Purple)
- **Background**: Dark theme with multiple shades
- **Text**: White and gray variations for hierarchy

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Responsive**: Scales appropriately across devices

### Animations
- Smooth page transitions
- Hover effects on cards and buttons
- Scroll-triggered animations
- Loading screen with spinner
- Typing animation for hero title

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

## 🚀 Deployment Instructions

### GitHub Pages Deployment

Follow these steps to deploy your portfolio to GitHub Pages:

#### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository: `umairmaqsood.github.io` (replace with your username)
5. Make it public
6. Click "Create repository"

#### Step 2: Upload Your Files

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/umairmaqsood.github.io.git
   cd umairmaqsood.github.io
   ```

2. Copy all your portfolio files to this directory:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
   - `CNAME` (if using custom domain)

3. Add and commit your files:
   ```bash
   git add .
   git commit -m "Initial portfolio website commit"
   git push origin main
   ```

#### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch
6. Click "Save"

#### Step 4: Custom Domain Setup (Optional)

If you want to use a custom domain like `www.umairmaqsood.com`:

1. Create a `CNAME` file in your repository root with content:
   ```
   www.umairmaqsood.com
   ```

2. In your domain registrar's DNS settings, add:
   - **Type**: CNAME
   - **Name**: www
   - **Value**: yourusername.github.io
   - **TTL**: 3600

3. In GitHub Pages settings, enter your custom domain:
   - Go to Settings > Pages
   - Enter your domain in "Custom domain" field
   - Check "Enforce HTTPS"

#### Step 5: Verify Deployment

1. Wait a few minutes for GitHub Pages to build and deploy
2. Visit your site at: `https://yourusername.github.io`
3. Or your custom domain if configured

## 🔧 Customization

### Updating Content

1. **Personal Information**: Edit `index.html` to update your name, email, and social links
2. **About Section**: Modify the about text in the HTML
3. **Skills**: Update skill levels in both HTML and CSS
4. **Projects**: Add or modify project cards in the HTML
5. **Styling**: Customize colors in `styles.css` CSS variables

### Color Customization

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #00d4ff;    /* Your primary color */
    --secondary-color: #7c3aed;  /* Your secondary color */
    --background-dark: #0a0a0a;  /* Dark background */
    /* ... other variables */
}
```

### Adding New Sections

1. Add HTML structure in `index.html`
2. Add corresponding styles in `styles.css`
3. Add any JavaScript functionality in `script.js`
4. Update navigation menu

## 📧 Contact Form

The contact form is currently set up to show success messages. To make it functional:

1. **Option 1**: Use a form service like Formspree
2. **Option 2**: Implement backend functionality
3. **Option 3**: Use email.js or similar service

## 🔍 SEO Optimization

The website includes:
- Semantic HTML structure
- Meta tags for description and viewport
- Proper heading hierarchy
- Alt text for images (when added)
- Fast loading times

## 🛠️ Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to fork this project and customize it for your own portfolio!

## 📞 Contact

- **Email**: umairmaqsood488@gmail.com
- **GitHub**: [Your GitHub Profile]
- **LinkedIn**: [Your LinkedIn Profile]

---

**Built with ❤️ by Umair Maqsood**

*Last updated: January 2025* 