import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="verAtendimento/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="criarContato" options={{ headerShown: false }} />
      <Stack.Screen name="editarAgendamento/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="historico" options={{ headerShown: false }} />
      <Stack.Screen name="novoAgendamento" options={{ headerShown: false }} />
      <Stack.Screen name="perfil" options={{ headerShown: false }} />
      <Stack.Screen name="verContatos" options={{ headerShown: false }} />
      <Stack.Screen name="editarContato" options={{ headerShown: false }} />
      <Stack.Screen name="agenda" options={{ headerShown: false }} />
      <Stack.Screen name="esqueceuSenha" options={{ headerShown: false }} />
    </Stack>
  );
}