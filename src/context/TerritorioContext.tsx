import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { consultarTempo } from '../api';
import { criarDemonstracao, lerEstado, validarConfig, validarLeitura } from '../domain';
import type { Estado, Config, SensorId } from '../domain';

const CHAVE = '@territorio-alerta/v1';
type Contexto = {
  estado: Estado; agora: number; carregando: boolean; erroLocal: string; erroApi: string; consultando: boolean;
  salvarConfig: (config: Config) => void; adicionar: (id: SensorId, valor: number) => void;
  reconhecer: (id: string) => void; reiniciarDemo: () => void; atualizarTempo: () => Promise<void>;
};
const ContextoTerritorio = createContext<Contexto | null>(null);
export function TerritorioProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<Estado>(() => criarDemonstracao());
  const [agora, setAgora] = useState(Date.now);
  const [carregando, setCarregando] = useState(true);
  const [podeGravar, setPodeGravar] = useState(false);
  const [erroLocal, setErroLocal] = useState('');
  const [erroApi, setErroApi] = useState('');
  const [consultando, setConsultando] = useState(false);
  const fila = useRef(Promise.resolve());
  const requisicao = useRef(0);
  useEffect(() => {
    const timer = setInterval(() => setAgora(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let ativo = true;
    AsyncStorage.getItem(CHAVE).then(texto => {
      if (!ativo) return;
      if (texto) setEstado(lerEstado(texto));
      setPodeGravar(true);
    }).catch(() => {
      if (ativo) setErroLocal('Não foi possível restaurar os dados locais. Os dados salvos foram preservados; as alterações desta sessão não serão gravadas. Tente abrir novamente ou confirme uma nova demonstração em Leituras.');
    }).finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, []);
  useEffect(() => {
    if (carregando || !podeGravar) return;
    const texto = JSON.stringify(estado);
    fila.current = fila.current.then(() => AsyncStorage.setItem(CHAVE, texto)).catch(() => {
      setErroLocal('Falha ao salvar no dispositivo. As alterações desta sessão podem ser perdidas.');
    });
  }, [estado, carregando, podeGravar]);
  function salvarConfig(config: Config) {
    validarConfig(config);
    requisicao.current++;
    setConsultando(false); setErroApi('');
    setEstado(e => ({ ...e, config, tempo: config.latitude !== e.config.latitude || config.longitude !== e.config.longitude ? null : e.tempo }));
  }
  function adicionar(id: SensorId, valor: number) {
    validarLeitura(id, valor);
    setEstado(e => ({ ...e, series: { ...e.series, [id]: [...e.series[id], { valor, instante: Date.now(), origem: 'MANUAL' as const }].slice(-120) } }));
  }
  function reconhecer(id: string) {
    setEstado(e => ({ ...e, reconhecidos: [...new Set([...e.reconhecidos, id])].slice(-200) }));
  }
  function reiniciarDemo() {
    requisicao.current++; setConsultando(false); setErroApi('');
    setPodeGravar(true); setErroLocal('');
    setEstado(e => ({ ...criarDemonstracao(), config: e.config, tempo: e.tempo }));
  }
  async function atualizarTempo() {
    const numero = ++requisicao.current;
    setConsultando(true); setErroApi('');
    try {
      const tempo = await consultarTempo(estado.config.latitude, estado.config.longitude);
      if (numero === requisicao.current) setEstado(e => ({ ...e, tempo }));
    } catch (erro) {
      if (numero === requisicao.current) setErroApi(erro instanceof Error ? erro.message : 'Falha de conexão. Tente novamente.');
    } finally { if (numero === requisicao.current) setConsultando(false); }
  }
  return <ContextoTerritorio.Provider value={{ estado, agora, carregando, erroLocal, erroApi, consultando, salvarConfig, adicionar, reconhecer, reiniciarDemo, atualizarTempo }}>{carregando ? <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#F3F6F5' }}><ActivityIndicator accessibilityLabel="Restaurando dados locais" /></View> : children}</ContextoTerritorio.Provider>;
}
export function useTerritorio() {
  const contexto = useContext(ContextoTerritorio);
  if (!contexto) throw new Error('Provider territorial ausente.');
  return contexto;
}
