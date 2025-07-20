import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useDatabase = () => {
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [debts, setDebts] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedCustomers = await AsyncStorage.getItem('customers');
        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

        const savedSuppliers = await AsyncStorage.getItem('suppliers');
        if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));

        const savedProducts = await AsyncStorage.getItem('products');
        if (savedProducts) setProducts(JSON.parse(savedProducts));

        const savedInvoices = await AsyncStorage.getItem('invoices');
        if (savedInvoices) setInvoices(JSON.parse(savedInvoices));

        const savedDebts = await AsyncStorage.getItem('debts');
        if (savedDebts) setDebts(JSON.parse(savedDebts));

        const savedPayments = await AsyncStorage.getItem('payments');
        if (savedPayments) setPayments(JSON.parse(savedPayments));
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('customers', JSON.stringify(customers));
      } catch (error) {
        console.error('Failed to save customers:', error);
      }
    };
    saveData();
  }, [customers]);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('suppliers', JSON.stringify(suppliers));
      } catch (error) {
        console.error('Failed to save suppliers:', error);
      }
    };
    saveData();
  }, [suppliers]);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('products', JSON.stringify(products));
      } catch (error) {
        console.error('Failed to save products:', error);
      }
    };
    saveData();
  }, [products]);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('invoices', JSON.stringify(invoices));
      } catch (error) {
        console.error('Failed to save invoices:', error);
      }
    };
    saveData();
  }, [invoices]);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('debts', JSON.stringify(debts));
      } catch (error) {
        console.error('Failed to save debts:', error);
      }
    };
    saveData();
  }, [debts]);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('payments', JSON.stringify(payments));
      } catch (error) {
        console.error('Failed to save payments:', error);
      }
    };
    saveData();
  }, [payments]);

  const addCustomer = (customer) => {
    const newCustomer = { ...customer, id: Date.now() };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (updatedCustomer) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === updatedCustomer.id ? updatedCustomer : customer
    ));
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  const addSupplier = (supplier) => {
    const newSupplier = { ...supplier, id: Date.now() };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = (updatedSupplier) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === updatedSupplier.id ? updatedSupplier : supplier
    ));
  };

  const deleteSupplier = (id) => {
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
  };

  const addProduct = (product) => {
    const newProduct = { ...product, id: Date.now() };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (updatedProduct) => {
    setProducts(prev => prev.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const addInvoice = (invoice) => {
    const nextId = invoices.length > 0 ? Math.max(...invoices.map(inv => inv.id)) + 1 : 1;
    const newInvoice = { ...invoice, id: nextId, date: new Date().toISOString() };
    setInvoices(prev => [...prev, newInvoice]);
  };

  const updateInvoice = (updatedInvoice) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === updatedInvoice.id ? updatedInvoice : invoice
    ));
  };

  const deleteInvoice = (id) => {
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
  };

  const addDebt = (debt) => {
    const newDebt = { ...debt, id: Date.now(), date: new Date().toISOString() };
    setDebts(prev => [...prev, newDebt]);
  };

  const updateDebt = (updatedDebt) => {
    setDebts(prev => prev.map(debt => 
      debt.id === updatedDebt.id ? updatedDebt : debt
    ));
  };

  const deleteDebt = (id) => {
    setDebts(prev => prev.filter(debt => debt.id !== id));
  };

  const addPayment = (payment) => {
    const newPayment = { ...payment, id: Date.now(), date: new Date().toISOString() };
    setPayments(prev => [...prev, newPayment]);
  };

  const updatePayment = (updatedPayment) => {
    setPayments(prev => prev.map(payment => 
      payment.id === updatedPayment.id ? updatedPayment : payment
    ));
  };

  const deletePayment = (id) => {
    setPayments(prev => prev.filter(payment => payment.id !== id));
  };

  return {
    customers, suppliers, products, invoices, debts, payments,
    addCustomer, updateCustomer, deleteCustomer,
    addSupplier, updateSupplier, deleteSupplier,
    addProduct, updateProduct, deleteProduct,
    addInvoice, updateInvoice, deleteInvoice,
    addDebt, updateDebt, deleteDebt,
    addPayment, updatePayment, deletePayment,
    setCustomers, setSuppliers, setProducts, setInvoices, setDebts, setPayments
  };
};

export default useDatabase;


