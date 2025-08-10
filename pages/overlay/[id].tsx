// pages/overlay/[id].tsx
import { useRouter } from "next/router";
import useSWR from "swr";
import "../../src/app/globals.css";

const fetcher = (url) => fetch(url).then((res) => res.json());

function Overlay() {
  const router = useRouter();
  const { id } = router.query;

  const { data, error } = useSWR(id ? `/api/campanhas/${id}` : null, fetcher, { refreshInterval: 1000 });

  if (error) return <div>Falha ao carregar a campanha.</div>;
  if (!data) return <div>Campanha não encontrada.</div>;

  return (
    <div className="flex flex-rol justify-between">
      {data.characters.map((character) => (
        <div key={character.id} className="flex flex-row items-center gap-4">
          <img src={character.icon} alt={character.name} className="size-32 aspect-square object-cover rounded-full" />
          <div className="flex flex-col">
            <div className="text-xl font-bold">{character.name}</div>
            {character.stats.map((stat) =>
              stat.barColor ? (
                <div className="h-6 w-48 bg-gray-200 rounded relative">
                  <div className="z-12 absolute top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%]">
                    {stat.value + " / " + stat.max}
                  </div>
                  <div
                    className={`h-6 rounded absolute top-0 left-0 z-0`}
                    style={{ width: `${(stat.value / stat.max) * 100}%`, backgroundColor: stat.barColor }}
                  />
                </div>
              ) : (
                stat.value + " / " + stat.max
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Overlay;
