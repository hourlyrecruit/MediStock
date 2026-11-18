
## MediStock — Medicine Stock & Expiry Management System

### 1. Project Overview
MediStock is a modern, frontend-only web application designed for small pharmacies, medical stores, and clinics to manage medicine inventory efficiently.
The application will allow users to maintain medicine records, track stock quantities, monitor batch expiry dates, identify low-stock medicines, and view inventory reports.
The primary objective is to develop a professional, visually appealing healthcare application with interactive features, 3D elements, high-quality images, and smooth animations.
The entire application will use realistic dummy data. No backend, database, or API integration is required.

### 2. Technology Stack
- Frontend: React JS with Vite
- Styling: Tailwind CSS
- Routing: React Router
- Animations: Framer Motion
- 3D Graphics: Three.js with React Three Fiber
- Charts: Recharts
- Icons: Lucide React
- Forms and Validation: React Hook Form and Zod
- Date Handling: date-fns
- Data Persistence: Browser localStorage

### 3. Application Modules

3.1 Dashboard

Create a visually attractive dashboard that provides an overview of the medicine inventory.
Features:
- Display total medicines and total usable stock units.
- Show low-stock medicines.
- Display expired and soon-to-expire batches.
- Show medicine distribution by category using charts.
- Display monthly stock additions.
- Include tables for low-stock medicines and upcoming expiries.
- Allow users to navigate to detailed pages by clicking dashboard cards.
All statistics and charts must update automatically when inventory data changes.

3.2 Medicine Management

This module allows users to manage medicine records.
Features:
- Add new medicines.
- View medicine details.
- Edit existing records.
- Search medicines by name or generic name.
- Filter by category and active status.
- Sort and paginate medicine lists.
- Activate or deactivate medicine records.
Medicine information:
- Medicine name and generic name.
- Medicine category.
- Manufacturer.
- Unit price.
- Minimum stock level.
- Description.
- Active or inactive status.
Use realistic fictional medicine data for demonstration purposes.

3.3 Stock and Batch Management

This module manages medicine quantities and individual batches.
Features:
- Add new medicine batches.
- Record incoming stock.
- Adjust existing stock quantities.
- Display batch numbers, quantities, and expiry dates.
- Search and filter batches.
- View stock transaction history.
Each medicine may have multiple batches with different quantities and expiry dates.
When stock is added or adjusted, the application must update the batch quantity, transaction history, and dashboard statistics automatically.
Negative stock quantities must not be allowed.

3.4 Expiry Management

This module helps users identify medicines that are approaching expiry or have already expired.
Features:
- Display all medicine batches with their expiry dates.
- Filter expired and soon-to-expire batches.
- Show the number of days remaining until expiry.
- Sort batches by expiry date.
- Highlight expiry status using clear colour-coded badges.
Expiry rules:
- More than 30 days remaining: Valid.
- Between 1 and 30 days remaining: Expiring Soon.
- Expiry date has passed: Expired.
Expiry status must be calculated separately for each batch using the current date.
Expired stock must be excluded from usable-stock totals and clearly distinguished from usable stock.

3.5 Low-Stock Alerts

This module identifies medicines that require replenishment.
Features:
- Display medicines below their minimum stock levels.
- Show usable quantity and minimum required quantity.
- Highlight low-stock items.
- Allow searching and filtering.
- Provide navigation to the relevant medicine and batch details.
Low-stock status must update automatically when stock quantities change.

3.6 Stock Transaction History

Maintain a simple record of stock operations performed within the application.
Features:
- Display stock additions and adjustments.
- Show medicine names and batch numbers.
- Display transaction dates and quantity changes.
- Include transaction type and optional remarks.
- Support search, filtering, and sorting.
Transaction records should be read-only after creation to preserve the history of stock operations.

3.7 Reports

Create a simple reporting module for inventory information.
Reports include:
- Complete medicine catalogue.
- Current usable stock.
- Low-stock medicines.
- Expiring-soon batches.
- Expired batches.
- Stock transaction history.
Users should be able to search, filter, and export the selected report data as CSV files.

3.8 Settings

Provide a basic settings page containing:
- Pharmacy display name.
- Currency display in Indian rupees (INR).
- Expiry alert threshold, defaulting to 30 days.
- Reset Demo Data option.
Resetting demo data must require confirmation before restoring the original dataset.

### 4. UI/UX and Visual Design Requirements
The application should have a premium, modern healthcare SaaS appearance.
Design Theme
- Primary colour: Emerald green.
- Background: White and light neutral shades.
- Cards: Clean white surfaces with subtle shadows.
- Text: Dark slate for readability.
- Status indicators: Green, amber, and red.
- Typography: Modern and easy to read.
3D Effects
Use 3D visuals selectively to improve the application’s appearance without distracting users from inventory management.
Examples:
- A 3D medical illustration featuring capsules, medicine bottles, or a medical cross.
- Floating medicine capsules on the welcome screen.
- Subtle depth and perspective effects on selected dashboard elements.
- Soft lighting and layered visual elements.
Keep 3D scenes lightweight and avoid unnecessary effects on data-heavy pages.
High-Quality Images
Use relevant healthcare imagery where appropriate, such as:
- Pharmacy interiors.
- Medicine shelves.
- Medical supplies.
- Medicine bottles and capsules.
- Healthcare-themed illustrations.
Images should be high-quality, optimized for performance, and consistent with the design theme.
Avoid placing large decorative images on every page. Prioritize imagery on the welcome screen and selected visual sections.
Animations
Use Framer Motion for:
- Smooth page transitions.
- Dashboard card entrance animations.
- Subtle hover and click effects.
- Modal and dropdown transitions.
- Animated chart entrances.
- Toast notification transitions.
- Smooth sidebar opening and closing.
Animations should be quick and subtle. Respect reduced-motion preferences and avoid animations that interfere with reading or using forms.

### 5. Application Layout
Use a consistent layout across the application.
Sidebar navigation:
- Dashboard
- Medicines
- Stock Management
- Expiry Management
- Low Stock
- Transactions
- Reports
- Settings
Header:
- Current page title and breadcrumbs.
- Global medicine search.
- Inventory notification indicator.
- User avatar and profile menu.
The sidebar should be collapsible on desktop and replaced by a mobile navigation menu on smaller screens.

### 6. Responsive Design
The application must work across desktop, tablet, and mobile devices.
- Desktop: Full sidebar, dashboard cards, charts, and detailed tables.
- Tablet: Collapsible navigation and adapted dashboard layouts.
- Mobile: Compact navigation, stacked cards, touch-friendly forms, and horizontally scrollable tables or compact card layouts.
All pages, forms, dialogs, and interactions must remain usable on smaller screens.

### 7. Dummy Data and Frontend Behaviour
Populate the application with realistic, fictional demo data, including:
- 25 medicine records.
- 35–40 medicine batches.
- 30 stock transaction records.
- Multiple medicine categories.
- Low-stock medicines.
- Valid, soon-to-expire, and expired batches.
- Active and inactive medicines.
Use consistent relationships between medicines, batches, and transactions.
All application functionality must work with this dummy data.
Use React state and localStorage to:
- Add and edit medicine records.
- Manage batch quantities.
- Record stock transactions.
- Update dashboard statistics.
- Maintain filters and search functionality.
- Preserve data after refreshing the browser.
Provide a Reset Demo Data option to restore the original dataset.

### 8. Project Scope Limitations
To keep the project small and manageable, exclude:
- Backend and database development.
- Real authentication and user management.
- Medicine sales and billing.
- Supplier management.
- Purchase orders.
- Payment processing.
- Barcode scanning.
- AI features.
- Email, SMS, and WhatsApp notifications.
- Multi-branch management.
- Patient and prescription management.

### 9. Expected Deliverables
The completed project should include:
- A fully functional React application.
- Responsive layouts for desktop, tablet, and mobile.
- Interactive dashboard and charts.
- Working medicine CRUD operations.
- Batch-wise stock and expiry management.
- Low-stock alerts and transaction history.
- Search, filtering, sorting, and pagination.
- CSV report exports.
- Realistic dummy data with localStorage persistence.
- 3D visuals, high-quality images, and smooth animations.
- Reusable components and a well-organized project structure.
- A README containing setup and execution instructions.

### 10. Development Approach
Implement the application in phases:
- Project setup, routing, layout, and design system.
- Dummy data, localStorage, and reusable components.
- Dashboard and medicine management.
- Batch-wise stock management and transaction history.
- Expiry management and low-stock alerts.
- Reports and settings.
- 3D visuals, animations, and responsive design refinement.
- Testing, bug fixes, and documentation.
Each phase should be tested before proceeding to the next.

### Final Outcome
MediStock should be a professional, visually impressive, and easy-to-use medicine inventory application that combines practical inventory management with modern UI design, 3D effects, high-quality imagery, and smooth animations.
All core features must operate entirely on the frontend using dummy data, without requiring a backend or external services.
