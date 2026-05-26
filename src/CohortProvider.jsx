import React, { useEffect } from 'react';
import { useParams, Outlet, useNavigate } from 'react-router-dom';

export default function CohortProvider() {
  const { org_id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (org_id) {
      sessionStorage.setItem('unkahi_org_id', org_id);
      // Redirect to the main application view after storing the token
      navigate('/', { replace: true });
    }
  }, [org_id, navigate]);

  return <Outlet />;
}
