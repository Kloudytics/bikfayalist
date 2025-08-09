# BikfayaList Branching Strategy

## 🌳 Branch Overview

### **Production Branches**
- **`v1-production-ready`** - Stable production code ready for deployment
- **`main`** - Legacy main branch (PostgreSQL migration baseline)

### **Development Branches**
- **`v4-features-testing`** ⭐ **CURRENT** - Active testing branch for business rules and feature refinement
- **`v3-enhancements`** - Previous enhancements and UI improvements
- **`v2-advanced-features`** - Advanced features development

### **Archive Branches**
- **`sqlite-mvp`** - Original SQLite MVP implementation
- **`postgres-migration`** - PostgreSQL migration work

## 🔄 Current Workflow

1. **Development**: Work on `v4-features-testing`
2. **Testing**: Test business rules, payment system, and user flows
3. **Refinement**: Make adjustments and improvements
4. **Merge**: Once stable → merge to `v1-production-ready`
5. **Deploy**: Deploy from `v1-production-ready` to production

## 📋 Current Feature Status

### ✅ **Completed in v4-features-testing**
- Complete payment & billing system (cash, Whish, OMT)
- Admin payment management interface
- User payments dashboard
- Featured listings promotion system
- Business rules engine for listing limits
- Homepage status filtering (ACTIVE posts only)
- Enhanced navigation with payment links

### 🔨 **Ready for Testing**
- Manual payment processing workflows
- Admin approval processes
- Featured listing promotions
- Monthly limit resets
- Lebanese payment method integrations

## 🎯 Next Steps

Use `v4-features-testing` to:
- Test business rules thoroughly
- Validate payment workflows
- Refine user experience
- Test Lebanese market features
- Ensure all admin tools work correctly

Once stable and tested → merge back to `v1-production-ready` for deployment.