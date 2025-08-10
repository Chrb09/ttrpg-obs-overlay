// TODO: fazer isso funcional
import { useRouter } from "next/router";
import useSWR from "swr";
import "../../../src/app/globals.css";

const fetcher = (url) => fetch(url).then((res) => res.json());

function Overlay() {
  const router = useRouter();
  const { id } = router.query;

  const { data, error } = useSWR(id ? `/api/campanhas/${id}` : null, fetcher, { refreshInterval: 1000 });

  if (error) return <div>Falha ao carregar o personagem.</div>;
  if (!data) return <div>Personagem não encontrado.</div>;

  const character = data.characters.find((char) => char.id === router.query.charId);

  return (
    <div className="flex flex-row items-center gap-4">
      <img src={character.icon} alt={character.name} className="size-32 aspect-square object-cover rounded-full" />
      <div className="flex flex-col">
        <div className="text-xl font-bold">{character.name}</div>
        {character.stats.map((stat) => (
          <div key={stat.name}>
            {stat.name} {stat.value} / {stat.max}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Overlay;
