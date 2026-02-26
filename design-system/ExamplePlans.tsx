import React from 'react';
import { Layout } from '../components/layout/Layout';
import { PlansHeader } from '../components/plans/PlansHeader';
import { PlansList } from '../components/plans/PlansList';

export function Plans() {
  return (
    <Layout>
      <div className="space-y-3">
        <PlansHeader />
        <PlansList />
      </div>
    </Layout>
  );
}