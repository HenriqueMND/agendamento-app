import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginPage from './src/pages/LoginPage';
import CadastroPage from './src/pages/CadastroPage';
import DashboardPage from './src/pages/DashboardPage';
import AgendaPage from './src/pages/AgendaPage';
import HistoricoPage from './src/pages/HistoricoPage';
import ClientesPage from './src/pages/ClientesPage';
import AdicionarAtendimentoPage from './src/pages/AdicionarAtendimentoPage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Cadastro" component={CadastroPage} />
        <Stack.Screen name="Dashboard" component={DashboardPage} />
        <Stack.Screen name="Agenda" component={AgendaPage} />
        <Stack.Screen name="Historico" component={HistoricoPage} />
        <Stack.Screen name="Clientes" component={ClientesPage} />
        <Stack.Screen name="AdicionarAtendimento" component={AdicionarAtendimentoPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
