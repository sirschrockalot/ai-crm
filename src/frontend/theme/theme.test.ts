import theme from './index';

describe('Theme Configuration', () => {
  it('should have the correct color scheme', () => {
    expect(theme.colors.primary).toBeDefined();
    expect(theme.colors.primary[500]).toBe('#2196f3');
    expect(theme.colors.secondary).toBeDefined();
    expect(theme.colors.secondary[500]).toBe('#9c27b0');
  });

  it('should have the correct fonts', () => {
    expect(theme.fonts.heading).toBe('Inter, system-ui, sans-serif');
    expect(theme.fonts.body).toBe('Inter, system-ui, sans-serif');
  });

  it('should have the correct breakpoints', () => {
    expect(theme.breakpoints.sm).toBe('30em');
    expect(theme.breakpoints.md).toBe('48em');
    expect(theme.breakpoints.lg).toBe('62em');
    expect(theme.breakpoints.xl).toBe('80em');
    expect(theme.breakpoints['2xl']).toBe('96em');
  });

  it('should have component configurations', () => {
    expect(theme.components.Button).toBeDefined();
    expect(theme.components.Input).toBeDefined();
  });
}); 