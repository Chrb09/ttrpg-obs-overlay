// pages/overlay/[id].tsx
import { useRouter } from "next/router";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

function Overlay() {
  const router = useRouter();
  const { id } = router.query;

  const { data, error } = useSWR(id ? `/api/campanhas/${id}` : null, fetcher, { refreshInterval: 1000 });
  /* 
  const { data, error } = useSWR(
  id ? `/api/campanhas/${id}` : null,
  fetcher,
  {
    refreshInterval: 4000, // Seu intervalo de atualização
    revalidateOnFocus: false, // Desativa a revalidação ao focar
    revalidateOnReconnect: false, // Opcional: Desativa a revalidação ao reconectar
  }
);*/

  if (error) return <div>Falha ao carregar a campanha.</div>;
  if (!data) return <div>Campanha não encontrada.</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>Sistema: {data.system}</p>
      <h2>Personagens</h2>
      <ul>
        {data.characters.map((character) => (
          <li key={character.id}>{character.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Overlay;
