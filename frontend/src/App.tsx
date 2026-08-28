import type { ReactElement } from 'react';

import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

function App(): ReactElement {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;