# **REXPLORE TECHNOLOGIES • ENTERPRISE SOLUTIONS**

## **PRODUCT REQUIREMENTS DOCUMENT (PRD)**

### **Project: Ramakrishna Foods (RK Foods) E-commerce Platform**

**Document Version:** 1.0  
**Project Lead:** Ramu Narlapati (Founder, Rexplore Technologies)  
**Client Support Lead:** RSMK (R. Srinivasa Manikanta)  
**Target Domain:** [ramakrishnafoods.telugu.in](http://ramakrishnafoods.telugu.in) (Staging: [vnlivevents-rexploretech.vercel.app](https://vnlivevents-rexploretech.vercel.app/))

## **1\. Executive Summary & Brand Strategy**

**Ramakrishna Foods (రామకృష్ణ ఫుడ్స్)** is an elite, heritage-first culinary brand dedicated to delivering traditional Telugu pickles, condiments, and premium sweets to household consumers across India and the global Telugu diaspora.  
This platform serves as the digital flagship for the brand, bridging generations of pure taste and household trust with high-performance e-commerce architecture. The platform is designed to make users "taste" the products within three seconds of landing on the site, utilizing high-contrast visual engineering, localized Telugu script, and intuitive micro-interactions.

## **2\. Comprehensive Visual Identity & Styling**

The design system is explicitly derived from the brand’s authentic Telugu visual assets, moving away from generic templates to establish a premium, high-contrast aesthetic.

### **2.1 Color Palette**

* **Primary Deep Clay/Terracotta Red (\#8B261E):** Represents traditional Indian earthenware pots (*kunda*) used historically for slow-fermenting and storing pickles.  
* **Secondary Warm Ochre/Mustard Yellow (\#E5A93C):** Reflects cold-pressed oils, freshly ground turmeric, and sun-dried mustard seeds.  
* **Background Matte Charcoal/Dark Slate (\#121212):** Serves as a high-contrast canvas, making the bright colors of the food photography pop dramatically.  
* **Neutral Warm Cream/Off-White (\#FAF9F6):** Used for readable text bodies, localized headings, and structural panels.

### **2.2 Aesthetic & Media Guidelines**

* **Cinematic Video Hero Banner:** An autoplaying, high-definition looping background video showing the preparation process: hand-sorting raw green mangoes, crushing coarse salt, and pouring hot, golden sesame oil over roasted spices.  
* **High-Contrast Macro Imagery:** All product cards must feature crisp, macro-level images of the jars placed on textured wooden or dark stone slabs, garnished with fresh green mango leaves and bright red chilies.  
* **The Chili-R Brand Mark:** The circular logo featuring the stylized red-and-green chili forming the letter "R" must be integrated into the navigation bar and favicon.

## **3\. Product Catalog & Regional Specialties**

The digital storefront will launch with two highly curated, high-margin product categories.  
**Unique Product Identification:** Every individual item listed in the digital catalog must be assigned a unique alphanumeric SKU (Stock Keeping Unit) identifier for inventory precision and tracking (e.g., 'RKF260605').

### **3.1 Traditional Telugu Pickles (ఆంధ్రా & తెలంగాణ పచ్చళ్ళు)**

Directly matching the five signature offerings showcased on the brand's promotional poster:

1. **అవకాయ (Avakaya \- Mango Pickle):** Crisp, raw green mango chunks marinated in a fiery blend of mustard powder, red chili, and cold-pressed sesame oil.  
2. **నిమ్మ (Nimma \- Lemon Pickle):** Thin-skinned yellow lemons cured in rock salt, fenugreek, and chili powder; offering a robust sour, salty, and tangy profile.  
3. **మగాయ (Magaya \- Dried Mango Pickle):** Sun-dried, peeled mango strips seasoned with mustard and fenugreek, offering a rich, concentrated sourness.  
4. **కరివేపాకు (Karivepaku \- Curry Leaf Pickle):** An intensely savory, herbaceous paste made from fresh curry leaves, tamarind pulp, garlic cloves, and toasted spices.  
5. **కూవేవాకు (Kuvevaku \- Gongura Style Sorrel Pickle):** Highly acidic, tangy sorrel leaves cooked with garlic and dried red chilies; a beloved rural Telugu classic.

### **3.2 Premium Telugu Sweets (సాంప్రదాయ మిఠాయిలు)**

A selection of delicacies sourced from historical sweet-making hubs:

* **Atreyapuram Pootharekulu (ఆత్రేయపురం పూతరేకులు):** Wafer-thin, translucent sheets of rice starch folded with pure ghee, sugar/jaggery, cardamom, and chopped dry fruits.1  
* **Nethi Ariselu (నేతి అరిసెలు):** Deep-fried golden discs of wet rice flour and jaggery, saturated with pure desi ghee and topped with toasted sesame seeds.  
* **Bandar Laddu (బందరు లడ్డు):** Velvety, smooth gram flour spheres slow-roasted in ghee and cardamom, containing a whole chewy raisin inside.1  
* **Madugula Halwa (మడుగుల హల్వా):** A legendary, nutrient-rich, chewy halwa made from fermented wheat milk, Araku forest honey, and cashews, slow-cooked over open firewood.2  
* **Pala Thalikalu (పాలతాళికలు):** Hand-rolled wet rice noodles cooked in thick, cardamom-scented milk and sweetened with cooled jaggery syrup.3  
* **Pala Munjalu (పాల ముంజలు):** Deep-fried golden dumplings with a creamy milk-semolina outer shell, filled with a sweet chana dal, coconut, and jaggery *poornam*.

### **3.3 Product Categorization**

All products must be organized into distinct categories to facilitate user browsing, including: 1\. All, 2\. Sweets, 3\. Pickles, 4\. Meals, etc.  
Sub-categorization: The 'Meals' and 'Pickles' categories must support 'Veg' and 'Non-Veg' modes, allowing users to filter products based on their dietary preference.

## **4\. Key Functional Features & User Experience (UX)**

### **4.1 "Spice & Sweetness" Heat Slider**

Every product description page will feature an interactive, animated slider detailing the flavor intensity. For pickles, the scale runs from *Mellow* to *Authentic Telugu* to *Fiery Guntur*. For sweets, the scale runs from *Mildly Sweet* to *Richly Indulgent*.

### **4.2 "Build Your Heritage Box" Sampler Module**

To drive engagement and gift-giving, users can utilize a drag-and-drop interface to customize a physical multi-pack. Customers drag three or four miniature jars (sweets or pickles) into a virtual cardboard gift box, with the price and bundle weight updating dynamically.

### **4.3 Direct-to-Cloud User Reviews (Direct Upload Hub)**

Customers can upload unboxing photos (.jpg), tasting video reviews (.mp4), or audio feedback (.mp3). To protect web application bandwidth and server resources, the frontend will leverage the Firebase SDK to stream these files **directly to Firebase Storage** folders (images/, videos/, audio/), returning only the secure HTTPS download URL to be stored inside the primary database document.

### **4.4 The Onboarding "User Agreement Lock"**

To maintain strict contractual alignment with B2B clients and commercial distributors entering the portal using their Unique Project ID (e.g., VSVBQUBB), the portal will deploy a frontend modal lock. If the client’s database record is marked as status: "Pending", they are blocked from viewing project logs until they scroll through, type their full legal name as a digital signature, and accept the **Master Services & User Agreement**.

### **4.5 Call-to-Action (CTA) Integrations**

The footer and contact page will feature direct hotlinks matching the poster details:

* **Phone Ordering:** Dynamic hotlink to dial 9876543210\.  
* **Customer Support Desk:** Direct route to open a chat ticket or email the support desk managed by **REXPLORE TECH**.

### **4.6 User Checkout Flow**

To ensure accurate order fulfillment, the checkout cart must include a mandatory "User Details Form." During the checkout process, customers are required to provide essential shipping and contact information, including their full Name, complete Shipping Address, Phone Number, and Email Address.  
Mandatory Authentication: To purchase products, users must be registered RK Foods users. Implement a mandatory sign-in/sign-up process using Google Authentication or Mobile Number verification before proceeding to checkout.

### **4.7 User Interface Design Philosophy**

The website UI will prioritize simplicity and ease of use, drawing inspiration from modern food delivery platforms like Zomato, Swiggy, and Instamart. This ensures an intuitive browsing and ordering experience for users purchasing pickles, sweets, and other food products.

### **4.8 Admin Dashboard (CRM)**

This subsection details the requirement for an administrative page designed to provide a comprehensive CRM (Customer Relationship Management) system. This admin page must enable continuous monitoring of user activity, real-time tracking of product deliveries, and management of price tracking analytics.  
Product Import Feature: Enable the admin dashboard to import bulk product data from external files, including .xlsx and .docx formats, for efficient catalog management.

### **4.9 Product Management**

The admin dashboard must include a dedicated product management module for adding new inventory. Each product entry must capture: Product Name, Product ID (automatically generated based on the preceding product's sequence), Actual Price, Selling Price, Ratings, and Deliverability/Availability status (calculated dynamically based on the customer's delivery address).  
Location Management: The admin panel must provide functionality to manage, update, and display the comprehensive list of all deliverable locations supported by the platform.

## **5\. Technical Stack & Architecture**

* **Frontend Framework:** Next.js (utilizing Server-Side Rendering for ultra-fast load times and high SEO indexing on regional search terms) paired with Tailwind CSS.  
* **Media Cloud Storage:** Firebase Storage (handling all high-res promotional banners, video loops, and user review uploads directly from the client side).  
* **Primary Database:** Cloud Firestore or MongoDB for catalog metadata, user reviews, shopping cart states, and real-time order tracking.  
* **Deployment Pipeline:** Vercel for continuous integration and hosting of the frontend application.  
* **Caching Strategy:** Implement advanced caching strategies to ensure rapid website responsiveness and lower latency.  
* **Project Structure:** The entire project must be organized into two major folders: /frontend and /backend.

### **© 2026 Rexplore Technologies. All Rights Reserved.**

#### **Central Portal: [rexplore.tech](https://rexplore.tech)**

