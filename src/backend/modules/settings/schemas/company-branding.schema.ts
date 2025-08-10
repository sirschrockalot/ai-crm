import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CompanyBrandingDocument = CompanyBranding & Document;

@Schema({ timestamps: true })
export class CompanyBranding {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, unique: true })
  tenantId: Types.ObjectId;

  @Prop({
    type: {
      name: { type: String, required: true },
      tagline: { type: String, default: '' },
      description: { type: String, default: '' },
      founded: { type: Number, default: null },
      mission: { type: String, default: '' },
      vision: { type: String, default: '' },
      values: [{ type: String }],
    },
    default: {},
  })
  company: {
    name: string;
    tagline: string;
    description: string;
    founded: number | null;
    mission: string;
    vision: string;
    values: string[];
  };

  @Prop({
    type: {
      logo: { type: String, default: '' },
      logoDark: { type: String, default: '' },
      favicon: { type: String, default: '' },
      heroImage: { type: String, default: '' },
      backgroundImage: { type: String, default: '' },
    },
    default: {},
  })
  visual: {
    logo: string;
    logoDark: string;
    favicon: string;
    heroImage: string;
    backgroundImage: string;
  };

  @Prop({
    type: {
      primaryColor: { type: String, default: '#3182CE' },
      secondaryColor: { type: String, default: '#E53E3E' },
      accentColor: { type: String, default: '#38A169' },
      textColor: { type: String, default: '#2D3748' },
      backgroundColor: { type: String, default: '#FFFFFF' },
      customCss: { type: String, default: '' },
    },
    default: {},
  })
  colors: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textColor: string;
    backgroundColor: string;
    customCss: string;
  };

  @Prop({
    type: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      website: { type: String, default: '' },
      socialMedia: {
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        instagram: { type: String, default: '' },
        youtube: { type: String, default: '' },
      },
    },
    default: {},
  })
  contact: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    socialMedia: {
      facebook: string;
      twitter: string;
      linkedin: string;
      instagram: string;
      youtube: string;
    };
  };

  @Prop({
    type: {
      headerText: { type: String, default: '' },
      footerText: { type: String, default: '' },
      welcomeMessage: { type: String, default: '' },
      termsOfService: { type: String, default: '' },
      privacyPolicy: { type: String, default: '' },
      cookiePolicy: { type: String, default: '' },
    },
    default: {},
  })
  content: {
    headerText: string;
    footerText: string;
    welcomeMessage: string;
    termsOfService: string;
    privacyPolicy: string;
    cookiePolicy: string;
  };

  @Prop({
    type: {
      enableCustomBranding: { type: Boolean, default: false },
      allowUserCustomization: { type: Boolean, default: false },
      brandingGuidelines: { type: String, default: '' },
      approvedAssets: [{ type: String }],
    },
    default: {},
  })
  customization: {
    enableCustomBranding: boolean;
    allowUserCustomization: boolean;
    brandingGuidelines: string;
    approvedAssets: string[];
  };
}

export const CompanyBrandingSchema = SchemaFactory.createForClass(CompanyBranding);

// Indexes
CompanyBrandingSchema.index({ tenantId: 1 });
CompanyBrandingSchema.index({ 'company.name': 1 });
CompanyBrandingSchema.index({ 'company.founded': 1 });
CompanyBrandingSchema.index({ 'contact.country': 1 });
CompanyBrandingSchema.index({ 'customization.enableCustomBranding': 1 });
