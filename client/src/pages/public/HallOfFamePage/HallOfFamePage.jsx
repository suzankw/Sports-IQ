import { Card } from '../../../components/Card/Card.jsx';
import { PageHeader } from '../../../components/PageHeader/PageHeader.jsx';
import { PhotoCard } from '../../../components/PhotoCard/PhotoCard.jsx';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { SportFilter } from '../../../components/SportFilter/SportFilter.jsx';
import { useList } from '../../../hooks/resources.js';
import { useSports } from '../../../hooks/sports.js';
import { useUrlState } from '../../../hooks/useUrlState.js';
import styles from './HallOfFamePage.module.css';

function InducteeCard({ inductee }) {
  return (
    <Card as="li" className={styles.card}>
      <PhotoCard
        photoUrl={inductee.photoUrl}
        name={inductee.name}
        eyebrow={inductee.sport?.name ?? 'Turi Sport'}
        eyebrowIcon={inductee.sport?.icon ?? 'workspace_premium'}
        detail={inductee.years}
      />
      <div className={styles.body}>
        <p className={styles.achievement}>{inductee.achievement}</p>
        {inductee.citation && <p className={styles.citation}>{inductee.citation}</p>}
      </div>
    </Card>
  );
}

/** Public Hall of Fame (D16's public side): every inductee, or one sport's. */
export function HallOfFamePage() {
  const [url, setUrl] = useUrlState({ sport: '' });
  const sportName = useSports().data?.find((s) => s.slug === url.sport)?.name;
  const inductees = useList('/inductees', { sport: url.sport || undefined });
  return (
    <>
      <title>{`Hall of Fame${sportName ? ` · ${sportName}` : ''} · Sports IQ`}</title>
      <PageHeader
        eyebrow="Hall of Fame"
        title={sportName ? `${sportName} Hall of Fame` : "Turi's Hall of Fame"}
        subtitle="Pupils and coaches whose achievements set the standard for every team that followed."
        actions={<SportFilter value={url.sport} onChange={(sport) => setUrl({ sport })} />}
      />
      <QueryState query={inductees} isEmpty={(list) => list.length === 0} emptyText="No one has been inducted here yet.">
        {(list) => (
          <ul className={styles.grid}>
            {list.map((inductee) => (
              <InducteeCard key={inductee.id} inductee={inductee} />
            ))}
          </ul>
        )}
      </QueryState>
    </>
  );
}
