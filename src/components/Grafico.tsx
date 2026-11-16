import { View, Text, StyleSheet } from 'react-native';
import type { Leitura } from '../domain';
import { cores } from './UI';

export function Grafico({ leituras, unidade }: { leituras: Leitura[]; unidade: string }) {
  const dados = leituras.slice(-8);
  const maximo = Math.max(1, ...dados.map(l => l.valor));
  return <View>
    <Text style={estilo.legenda}>Últimas {dados.length} leituras • {unidade} • ordem de coleta</Text>
    <View style={estilo.grafico}>
      {dados.map((l, i) => <View key={`${l.instante}-${i}`} accessible accessibilityLabel={`Leitura ${i + 1}: ${l.valor.toFixed(1)} ${unidade}, ${l.origem}`} style={estilo.coluna}>
        <Text style={estilo.numero}>{l.valor.toFixed(0)}</Text>
        <View style={[estilo.barra, { height: Math.max(2, (l.valor / maximo) * 90) }]} />
        <Text style={estilo.numero}>{i + 1}</Text>
      </View>)}
    </View>
    <Text style={estilo.legenda}>Valores e origens também estão na tela Leituras.</Text>
  </View>;
}
const estilo = StyleSheet.create({
  grafico: { flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: 6, marginBottom: 10 },
  coluna: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 7 },
  barra: { width: '85%', backgroundColor: cores.verde, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  numero: { fontSize: 11, color: cores.cinza }, legenda: { fontSize: 12, color: cores.cinza, lineHeight: 19 },
});
