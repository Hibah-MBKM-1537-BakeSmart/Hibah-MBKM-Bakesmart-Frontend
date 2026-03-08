'use client';

import React from 'react';
import { CustomersProvider, useCustomers } from '../../contexts/CustomersContext';
import CustomersHeader from '../../../components/adminPage/customersPage/CustomersHeader';
import CustomersFilter from '../../../components/adminPage/customersPage/CustomersFilter';
import CustomersTable from '../../../components/adminPage/customersPage/CustomersTable';
import CustomerDetailModal from '../../../components/adminPage/customersPage/CustomerDetailModal';
import { WhatsAppBlastModal } from '../../../components/adminPage/customersPage/WhatsAppBlastModal';
import { useAppAlert } from "@/components/AppAlert";

function CustomersContent() {
  const { state, closeWhatsAppBlast } = useCustomers();
  const { success, error : alertError, confirm } =  useAppAlert();

  return (
    <div className="p-6">
      <CustomersHeader />
      <CustomersFilter />
      <CustomersTable />
      <CustomerDetailModal />
      <WhatsAppBlastModal 
        isOpen={state.showWhatsAppBlast} 
        onClose={closeWhatsAppBlast} 
      />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <CustomersProvider>
      <CustomersContent />
    </CustomersProvider>
  );
}
