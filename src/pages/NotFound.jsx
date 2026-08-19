import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import SectionTitle from '../components/SectionTitle';

export default function NotFound() {
  return (
    <section className="page not-found">
      <div className="container narrow text-center">
        <SectionTitle
          eyebrow="404"
          title="Looks like this tech wandered off."
          text="That page is not here, but we can still help with the technology problem that brought you here."
        />
        <div className="not-found-actions">
          <Button component={Link} to="/" variant="contained" className="mui-red-button">Back Home</Button>
          <Button component={Link} to="/service-request" variant="outlined" className="mui-navy-outline-button">Request Service</Button>
        </div>
      </div>
    </section>
  );
}
