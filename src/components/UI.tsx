import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTerritorio } from '../context/TerritorioContext';

export const cores = { fundo: '#F3F6F5', tinta: '#173A35', verde: '#17634F', suave: '#E3EDE8', cinza: '#52645F', linha: '#D5DFDB', vermelho: '#9D2731' };
export function Tela({ children, titulo, subtitulo }: { children: React.ReactNode; titulo: string; subtitulo: string }) {
  const { carregando, erroLocal } = useTerritorio();
  return <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}><ScrollView contentContainerStyle={s.conteudo} keyboardShouldPersistTaps="handled">
    <Text style={s.marca}>CITIZEN TECH / TERRITÓRIO ALERTA</Text>
    <Text accessibilityRole="header" style={s.titulo}>{titulo}</Text><Text style={s.subtitulo}>{subtitulo}</Text>
    {erroLocal ? <Aviso texto={erroLocal} erro /> : null}
    {carregando ? <ActivityIndicator accessibilityLabel="Carregando dados locais" color={cores.verde} /> : children}
    <Text style={s.rodape}>Projeto acadêmico • Decisões continuam com as pessoas.</Text>
  </ScrollView></SafeAreaView>;
}
export function Cartao({ children }: { children: React.ReactNode }) { return <View style={s.cartao}>{children}</View>; }
export function Titulo({ children }: { children: React.ReactNode }) { return <Text accessibilityRole="header" style={s.secao}>{children}</Text>; }
export function Texto({ children }: { children: React.ReactNode }) { return <Text style={s.texto}>{children}</Text>; }
export function Aviso({ texto, erro = false }: { texto: string; erro?: boolean }) { return <View style={[s.aviso, erro && s.avisoErro]}><Text accessibilityLiveRegion="polite" style={[s.texto, erro && { color: cores.vermelho }]}>{texto}</Text></View>; }
export function Botao({ titulo, onPress, secundario = false, disabled = false }: { titulo: string; onPress: () => void; secundario?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.botao, secundario && s.botaoSec, (pressed || disabled) && { opacity: 0.65 }]}><Text style={[s.botaoTexto, secundario && { color: cores.verde }]}>{titulo}</Text></Pressable>;
}
export function Campo({ label, value, onChangeText, numerico = false, rotuloAcessivel }: { label: string; value: string; onChangeText: (value: string) => void; numerico?: boolean; rotuloAcessivel?: string }) {
  return <View style={s.campo}><Text style={s.rotulo}>{label}</Text><TextInput accessibilityLabel={rotuloAcessivel ?? label} style={s.input} value={value} onChangeText={onChangeText} keyboardType={numerico ? 'numbers-and-punctuation' : 'default'} maxLength={numerico ? 16 : 60} /></View>;
}
export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 20, gap: 16, width: '100%', maxWidth: 760, alignSelf: 'center', paddingBottom: 32 },
  marca: { color: cores.verde, fontSize: 11, fontWeight: '800', letterSpacing: 1.3, marginTop: 6 },
  titulo: { color: cores.tinta, fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  subtitulo: { fontSize: 16, lineHeight: 23, color: cores.cinza, marginTop: -8, marginBottom: 4 },
  secao: { fontSize: 20, fontWeight: '700', color: cores.tinta, marginBottom: 4 },
  cartao: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: cores.linha },
  texto: { fontSize: 15, lineHeight: 23, color: cores.cinza },
  aviso: { padding: 16, backgroundColor: cores.suave, borderRadius: 12 },
  avisoErro: { backgroundColor: '#FCEDEF' },
  botao: { backgroundColor: cores.verde, minHeight: 48, justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 10 },
  botaoSec: { backgroundColor: cores.suave },
  botaoTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  campo: { gap: 7 }, rotulo: { color: cores.tinta, fontSize: 14, fontWeight: '600' },
  input: { borderColor: '#839B91', borderWidth: 1, borderRadius: 9, minHeight: 48, padding: 12, fontSize: 16, color: cores.tinta, backgroundColor: '#FFFFFF' },
  rodape: { color: cores.cinza, textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 12 },
  valor: { color: cores.tinta, fontSize: 30, fontWeight: '800' },
  etiqueta: { color: cores.verde, fontWeight: '800', fontSize: 12, letterSpacing: 0.7 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
});
