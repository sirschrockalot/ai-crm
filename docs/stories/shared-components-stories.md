# 🎯 Shared Components - User Stories

## 📋 Overview

**Epic:** EPIC-ACQ-MVP-001 - Acquisitions MVP Core Workflows  
**Components:** Reusable UI components  
**Priority:** HIGH (Supporting MVP implementation)  
**Estimated Effort:** 3 days  
**Dependencies:** None (can be developed in parallel)  

## 🎯 Epic Goal

Create reusable UI components that will be shared across the Acquisitions Dashboard, Lead Queue Management, and Lead Detail View. These components ensure consistency and reduce development time.

---

## 📚 User Stories

### **STORY-SHARED-001: Lead Status Badge Component**

**Story ID:** STORY-SHARED-001  
**Story Type:** Foundation  
**Priority:** HIGH  
**Estimated Effort:** 0.5 days  
**Dependencies:** None  

**As a** developer  
**I want** a reusable status badge component  
**So that** I can display lead status consistently across all screens

**Mockup Reference:** Status badges from all three mockup files - follow exact design patterns

**Acceptance Criteria:**
- [ ] **Status Types:** Support all lead statuses (New, Contacted, Qualified, Converted)
- [ ] **Color Scheme:** Exact colors from mockups
  - New: #DBEAFE background, #1E40AF text
  - Contacted: #FEF3C7 background, #92400E text
  - Qualified: #D1FAE5 background, #065F46 text
  - Converted: #DBEAFE background, #1E40AF text
- [ ] **Styling:** 12px border radius, 0.25rem padding, proper font weights
- [ ] **Props Interface:** Accept status prop and optional custom styling
- [ ] **Accessibility:** Proper ARIA labels and screen reader support
- [ ] **Responsive:** Works on all screen sizes
- [ ] **Reusable:** Can be imported and used across all components

**Technical Requirements:**
- Create `LeadStatusBadge` component in `src/frontend/components/shared/`
- Use TypeScript with proper prop interfaces
- Implement all status types with exact colors
- Add proper accessibility attributes
- Create comprehensive unit tests

**Definition of Done:**
- [ ] Component renders all status types correctly
- [ ] All styling matches mockup exactly
- [ ] Component is fully accessible
- [ ] Unit tests cover all status types
- [ ] Component can be imported and used anywhere

---

### **STORY-SHARED-002: Action Button Component**

**Story ID:** STORY-SHARED-002  
**Story Type:** Foundation  
**Priority:** HIGH  
**Estimated Effort:** 0.5 days  
**Dependencies:** None  

**As a** developer  
**I want** a reusable action button component  
**So that** I can create consistent action buttons across all screens

**Mockup Reference:** Action buttons from all three mockup files

**Acceptance Criteria:**
- [ ] **Button Variants:** Primary, secondary, and danger button styles
- [ ] **Button Sizes:** Small, medium, and large button sizes
- [ ] **Icon Support:** Optional icon prop with proper positioning
- [ ] **Loading States:** Loading spinner for async actions
- [ ] **Disabled States:** Proper disabled styling and behavior
- [ ] **Hover Effects:** Smooth transitions and hover states
- [ ] **Accessibility:** Proper ARIA labels and keyboard navigation
- [ ] **Responsive:** Works on all screen sizes

**Technical Requirements:**
- Create `ActionButton` component in `src/frontend/components/shared/`
- Use TypeScript with proper prop interfaces
- Implement all button variants and sizes
- Add loading and disabled states
- Create comprehensive unit tests

**Definition of Done:**
- [ ] All button variants render correctly
- [ ] Loading and disabled states work properly
- [ ] Component is fully accessible
- [ ] Unit tests cover all variants
- [ ] Component can be imported and used anywhere

---

### **STORY-SHARED-003: Card Container Component**

**Story ID:** STORY-SHARED-003  
**Story Type:** Foundation  
**Priority:** HIGH  
**Estimated Effort:** 0.5 days  
**Dependencies:** None  

**As a** developer  
**I want** a reusable card container component  
**So that** I can create consistent card layouts across all screens

**Mockup Reference:** Card layouts from all three mockup files

**Acceptance Criteria:**
- [ ] **Card Styling:** White background, 12px border radius, box shadows
- [ ] **Padding Options:** Configurable padding (1rem, 1.5rem, 2rem)
- [ ] **Border Options:** Optional borders with proper styling
- [ ] **Header Support:** Optional header section with styling
- [ ] **Content Area:** Flexible content area with proper spacing
- [ ] **Hover Effects:** Optional hover states and transitions
- [ ] **Responsive:** Adapts to different screen sizes
- [ ] **Accessibility:** Proper semantic structure

**Technical Requirements:**
- Create `CardContainer` component in `src/frontend/components/shared/`
- Use TypeScript with proper prop interfaces
- Implement configurable padding and border options
- Add optional header support
- Create comprehensive unit tests

**Definition of Done:**
- [ ] Card renders with all styling options correctly
- [ ] Header support works properly
- [ ] Component is responsive and accessible
- [ ] Unit tests cover all configurations
- [ ] Component can be imported and used anywhere

---

### **STORY-SHARED-004: Data Table Component**

**Story ID:** STORY-SHARED-004  
**Story Type:** Foundation  
**Priority:** HIGH  
**Estimated Effort:** 1 day  
**Dependencies:** None  

**As a** developer  
**I want** a reusable data table component  
**So that** I can create consistent tables across all screens

**Mockup Reference:** Table layouts from lead-queue.html and other mockups

**Acceptance Criteria:**
- [ ] **Table Structure:** Sortable columns with proper headers
- [ ] **Row Styling:** Alternating row colors and hover effects
- [ ] **Sorting:** Click column headers to sort data
- [ ] **Pagination:** Built-in pagination with configurable page sizes
- [ ] **Selection:** Optional row selection with checkboxes
- [ ] **Loading States:** Loading indicators for data fetching
- [ ] **Empty States:** Proper handling of empty data
- [ ] **Responsive:** Adapts to different screen sizes
- [ ] **Accessibility:** Proper table semantics and ARIA labels

**Technical Requirements:**
- Create `DataTable` component in `src/frontend/components/shared/`
- Use TypeScript with proper prop interfaces
- Implement sorting and pagination functionality
- Add row selection support
- Create comprehensive unit tests

**Definition of Done:**
- [ ] Table renders with all features correctly
- [ ] Sorting and pagination work properly
- [ ] Row selection functions correctly
- [ ] Component is responsive and accessible
- [ ] Unit tests cover all functionality

---

### **STORY-SHARED-005: Search Input Component**

**Story ID:** STORY-SHARED-005  
**Story Type:** Foundation  
**Priority:** HIGH  
**Estimated Effort:** 0.5 days  
**Dependencies:** None  

**As a** developer  
**I want** a reusable search input component  
**So that** I can create consistent search functionality across all screens

**Mockup Reference:** Search inputs from all three mockup files

**Acceptance Criteria:**
- [ ] **Input Styling:** Matches mockup design exactly
- [ ] **Search Icon:** Left-aligned search icon with proper positioning
- [ ] **Placeholder Text:** Configurable placeholder text
- [ ] **Debounced Input:** Debounced input for performance
- [ ] **Clear Button:** Optional clear button for search input
- [ ] **Loading States:** Loading indicator during search
- [ ] **Accessibility:** Proper ARIA labels and keyboard navigation
- [ ] **Responsive:** Works on all screen sizes

**Technical Requirements:**
- Create `SearchInput` component in `src/frontend/components/shared/`
- Use TypeScript with proper prop interfaces
- Implement debounced input functionality
- Add loading and clear button support
- Create comprehensive unit tests

**Definition of Done:**
- [ ] Search input renders with correct styling
- [ ] Debounced input works properly
- [ ] Loading and clear functionality work
- [ ] Component is accessible and responsive
- [ ] Unit tests cover all functionality

---

## 📊 Story Dependencies and Sequencing

### **Day 1: Foundation Components**
- **STORY-SHARED-001:** Lead Status Badge Component
- **STORY-SHARED-002:** Action Button Component
- **STORY-SHARED-003:** Card Container Component

### **Day 2: Advanced Components**
- **STORY-SHARED-004:** Data Table Component
- **STORY-SHARED-005:** Search Input Component

### **Day 3: Integration & Testing**
- Integration testing with main components
- Performance optimization and bug fixes

## 🎯 Success Criteria

### **Shared Components Success Metrics:**
- **Reusability:** Components can be used across all three main screens
- **Consistency:** All components follow the same design patterns
- **Performance:** Components render efficiently
- **Accessibility:** All components meet WCAG 2.1 AA standards

### **Development Success Metrics:**
- **Story Completion:** All 5 stories completed within 3 days
- **Code Quality:** 90%+ test coverage for all components
- **Performance:** Components render quickly and efficiently
- **Integration:** Seamless integration with main screen components

## 🚀 Ready for Development

**Development team can start with any shared component story** as they can be developed in parallel with the main screen stories.

**IMPORTANT:** These components must match the exact design patterns from the mockups to ensure visual consistency across all screens.
