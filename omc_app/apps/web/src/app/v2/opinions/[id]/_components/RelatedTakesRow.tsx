import { type MockTake } from '../../../_data/mock-takes';
import { TakeCard } from '../../../_components/TakeCard';

type RelatedTakesRowProps = {
  title: string;
  takes: MockTake[];
};

export function RelatedTakesRow({ title, takes }: RelatedTakesRowProps) {
  if (takes.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="font-display font-black text-[18px] md:text-[22px] tracking-tight mb-4">
        {title}
      </div>
      <div className="-mx-4 md:-mx-10 px-4 md:px-10 overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 min-w-max pb-3">
          {takes.map((take, i) => (
            <div key={take.id} className="w-[240px] shrink-0">
              <TakeCard take={take} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
