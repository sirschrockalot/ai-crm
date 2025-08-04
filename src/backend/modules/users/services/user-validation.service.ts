import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

@Injectable()
export class UserValidationService {
  /**
   * Validate user creation data
   */
  async validateCreateUser(createUserDto: CreateUserDto): Promise<void> {
    // Validate email format
    if (!this.isValidEmail(createUserDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Validate name length
    if (createUserDto.firstName.length < 1 || createUserDto.firstName.length > 50) {
      throw new BadRequestException('First name must be between 1 and 50 characters');
    }

    if (createUserDto.lastName.length < 1 || createUserDto.lastName.length > 50) {
      throw new BadRequestException('Last name must be between 1 and 50 characters');
    }

    // Validate display name if provided
    if (createUserDto.displayName && (createUserDto.displayName.length < 1 || createUserDto.displayName.length > 100)) {
      throw new BadRequestException('Display name must be between 1 and 100 characters');
    }

    // Validate phone number if provided
    if (createUserDto.profile?.phone && !this.isValidPhoneNumber(createUserDto.profile.phone)) {
      throw new BadRequestException('Invalid phone number format');
    }

    // Validate website URL if provided
    if (createUserDto.profile?.website && !this.isValidUrl(createUserDto.profile.website)) {
      throw new BadRequestException('Invalid website URL format');
    }

    // Validate social media URLs if provided
    if (createUserDto.profile?.socialMedia) {
      const { linkedin, twitter, facebook } = createUserDto.profile.socialMedia;
      
      if (linkedin && !this.isValidUrl(linkedin)) {
        throw new BadRequestException('Invalid LinkedIn URL format');
      }
      
      if (twitter && !this.isValidUrl(twitter)) {
        throw new BadRequestException('Invalid Twitter URL format');
      }
      
      if (facebook && !this.isValidUrl(facebook)) {
        throw new BadRequestException('Invalid Facebook URL format');
      }
    }

    // Validate tags if provided
    if (createUserDto.tags && createUserDto.tags.length > 10) {
      throw new BadRequestException('Maximum 10 tags allowed');
    }

    if (createUserDto.tags) {
      for (const tag of createUserDto.tags) {
        if (tag.length < 1 || tag.length > 20) {
          throw new BadRequestException('Tags must be between 1 and 20 characters');
        }
      }
    }
  }

  /**
   * Validate user update data
   */
  async validateUpdateUser(updateUserDto: UpdateUserDto): Promise<void> {
    // Validate email format if provided
    if (updateUserDto.email && !this.isValidEmail(updateUserDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Validate name length if provided
    if (updateUserDto.firstName && (updateUserDto.firstName.length < 1 || updateUserDto.firstName.length > 50)) {
      throw new BadRequestException('First name must be between 1 and 50 characters');
    }

    if (updateUserDto.lastName && (updateUserDto.lastName.length < 1 || updateUserDto.lastName.length > 50)) {
      throw new BadRequestException('Last name must be between 1 and 50 characters');
    }

    // Validate display name if provided
    if (updateUserDto.displayName && (updateUserDto.displayName.length < 1 || updateUserDto.displayName.length > 100)) {
      throw new BadRequestException('Display name must be between 1 and 100 characters');
    }

    // Validate phone number if provided
    if (updateUserDto.profile?.phone && !this.isValidPhoneNumber(updateUserDto.profile.phone)) {
      throw new BadRequestException('Invalid phone number format');
    }

    // Validate website URL if provided
    if (updateUserDto.profile?.website && !this.isValidUrl(updateUserDto.profile.website)) {
      throw new BadRequestException('Invalid website URL format');
    }

    // Validate social media URLs if provided
    if (updateUserDto.profile?.socialMedia) {
      const { linkedin, twitter, facebook } = updateUserDto.profile.socialMedia;
      
      if (linkedin && !this.isValidUrl(linkedin)) {
        throw new BadRequestException('Invalid LinkedIn URL format');
      }
      
      if (twitter && !this.isValidUrl(twitter)) {
        throw new BadRequestException('Invalid Twitter URL format');
      }
      
      if (facebook && !this.isValidUrl(facebook)) {
        throw new BadRequestException('Invalid Facebook URL format');
      }
    }

    // Validate tags if provided
    if (updateUserDto.tags && updateUserDto.tags.length > 10) {
      throw new BadRequestException('Maximum 10 tags allowed');
    }

    if (updateUserDto.tags) {
      for (const tag of updateUserDto.tags) {
        if (tag.length < 1 || tag.length > 20) {
          throw new BadRequestException('Tags must be between 1 and 20 characters');
        }
      }
    }

    // Validate permissions if provided
    if (updateUserDto.permissions && updateUserDto.permissions.length > 50) {
      throw new BadRequestException('Maximum 50 permissions allowed');
    }

    if (updateUserDto.permissions) {
      for (const permission of updateUserDto.permissions) {
        if (permission.length < 1 || permission.length > 100) {
          throw new BadRequestException('Permission names must be between 1 and 100 characters');
        }
      }
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation - allows various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
  }

  /**
   * Validate URL format
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize user data
   */
  sanitizeUserData(userData: any): any {
    const sanitized = { ...userData };

    // Sanitize email
    if (sanitized.email) {
      sanitized.email = sanitized.email.toLowerCase().trim();
    }

    // Sanitize names
    if (sanitized.firstName) {
      sanitized.firstName = sanitized.firstName.trim();
    }

    if (sanitized.lastName) {
      sanitized.lastName = sanitized.lastName.trim();
    }

    if (sanitized.displayName) {
      sanitized.displayName = sanitized.displayName.trim();
    }

    // Sanitize profile data
    if (sanitized.profile) {
      if (sanitized.profile.phone) {
        sanitized.profile.phone = sanitized.profile.phone.trim();
      }

      if (sanitized.profile.company) {
        sanitized.profile.company = sanitized.profile.company.trim();
      }

      if (sanitized.profile.position) {
        sanitized.profile.position = sanitized.profile.position.trim();
      }

      if (sanitized.profile.bio) {
        sanitized.profile.bio = sanitized.profile.bio.trim();
      }

      if (sanitized.profile.website) {
        sanitized.profile.website = sanitized.profile.website.trim();
      }

      // Sanitize address
      if (sanitized.profile.address) {
        const address = sanitized.profile.address;
        if (address.street) address.street = address.street.trim();
        if (address.city) address.city = address.city.trim();
        if (address.state) address.state = address.state.trim();
        if (address.zipCode) address.zipCode = address.zipCode.trim();
        if (address.country) address.country = address.country.trim();
      }

      // Sanitize social media
      if (sanitized.profile.socialMedia) {
        const social = sanitized.profile.socialMedia;
        if (social.linkedin) social.linkedin = social.linkedin.trim();
        if (social.twitter) social.twitter = social.twitter.trim();
        if (social.facebook) social.facebook = social.facebook.trim();
      }
    }

    // Sanitize tags
    if (sanitized.tags) {
      sanitized.tags = sanitized.tags.map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
    }

    // Sanitize permissions
    if (sanitized.permissions) {
      sanitized.permissions = sanitized.permissions.map((permission: string) => permission.trim()).filter((permission: string) => permission.length > 0);
    }

    return sanitized;
  }

  /**
   * Validate search parameters
   */
  validateSearchParams(searchParams: any): void {
    const { page, limit, search, sortBy, sortOrder } = searchParams;

    // Validate page
    if (page && (page < 1 || !Number.isInteger(page))) {
      throw new BadRequestException('Page must be a positive integer');
    }

    // Validate limit
    if (limit && (limit < 1 || limit > 100 || !Number.isInteger(limit))) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    // Validate search term
    if (search && (search.length < 1 || search.length > 100)) {
      throw new BadRequestException('Search term must be between 1 and 100 characters');
    }

    // Validate sort order
    if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
      throw new BadRequestException('Sort order must be either "asc" or "desc"');
    }

    // Validate sort by field
    const allowedSortFields = [
      'createdAt', 'updatedAt', 'email', 'firstName', 'lastName', 
      'displayName', 'status', 'role', 'lastLoginAt', 'lastActiveAt'
    ];
    
    if (sortBy && !allowedSortFields.includes(sortBy)) {
      throw new BadRequestException(`Invalid sort field. Allowed fields: ${allowedSortFields.join(', ')}`);
    }
  }
} 