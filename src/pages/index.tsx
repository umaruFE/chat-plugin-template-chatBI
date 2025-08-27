import { ThemeProvider } from '@lobehub/ui';

export default function Home() {
  return (
    <ThemeProvider themeMode={'auto'}>
      <div>Home Page Content</div>
    </ThemeProvider>
  );
}
