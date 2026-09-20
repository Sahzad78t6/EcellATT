// Pure dark-mode stub for backwards compatibility
export const useTheme = () => {
  return {
    theme: 'dark',
    isDark: true,
    toggleTheme: () => {}
  };
};

export default useTheme;
