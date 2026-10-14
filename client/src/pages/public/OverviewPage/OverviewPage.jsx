import { useParams } from 'react-router';
import { PageHeader } from '../../../components/PageHeader/PageHeader.jsx';
import { QueryState } from '../../../components/QueryState/QueryState.jsx';
import { useSport } from '../../../hooks/sports.js';

export function OverviewPage() {
  const { sport: slug } = useParams();
  const sport = useSport(slug);
  return (
    <QueryState query={sport}>
      {(data) => (
        <>
          <title>{`${data.name} · Sports IQ`}</title>
          <PageHeader eyebrow="Sport overview" title={data.name} />
        </>
      )}
    </QueryState>
  );
}
