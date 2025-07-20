import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import useDatabase from './hooks/useDatabase';
import useSettings from './hooks/useSettings';
import { formatCurrency, formatDate } from './utils/formatters';
import { translations } from './constants/translations';
import { Picker } from '@react-native-picker/picker';

// مكونات النماذج (ستكون في ملفات منفصلة لاحقًا)
const CustomerForm = ({ customer, onSave, onCancel, t }) => {
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');

  const handleSubmit = () => {
    if (name.trim()) {
      onSave({ ...customer, name: name.trim(), phone: phone.trim() });
    } else {
      Alert.alert('خطأ', 'الاسم لا يمكن أن يكون فارغًا');
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{customer ? 'تعديل العميل' : 'إضافة عميل جديد'}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.customerName}
          value={name}
          onChangeText={setName}
          required
        />
        <TextInput
          style={styles.input}
          placeholder={t.customerPhone}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <View style={styles.formActions}>
          <TouchableOpacity style={styles.buttonSecondary} onPress={onCancel}>
            <Text style={styles.buttonTextSecondary}>{t.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
            <Text style={styles.buttonTextPrimary}>{t.save}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const SupplierForm = ({ supplier, onSave, onCancel, t }) => {
  const [name, setName] = useState(supplier?.name || '');
  const [phone, setPhone] = useState(supplier?.phone || '');

  const handleSubmit = () => {
    if (name.trim()) {
      onSave({ ...supplier, name: name.trim(), phone: phone.trim() });
    } else {
      Alert.alert('خطأ', 'الاسم لا يمكن أن يكون فارغًا');
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{supplier ? 'تعديل المورد' : 'إضافة مورد جديد'}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.supplierName}
          value={name}
          onChangeText={setName}
          required
        />
        <TextInput
          style={styles.input}
          placeholder={t.supplierPhone}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <View style={styles.formActions}>
          <TouchableOpacity style={styles.buttonSecondary} onPress={onCancel}>
            <Text style={styles.buttonTextSecondary}>{t.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
            <Text style={styles.buttonTextPrimary}>{t.save}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const ProductForm = ({ product, onSave, onCancel, t }) => {
  const [name, setName] = useState(product?.name || '');
  const [costPrice, setCostPrice] = useState(String(product?.costPrice || ''));
  const [sellPrice, setSellPrice] = useState(String(product?.sellPrice || ''));
  const [quantity, setQuantity] = useState(String(product?.quantity || ''));

  const handleSubmit = () => {
    if (name.trim()) {
      onSave({
        ...product,
        name: name.trim(),
        costPrice: parseFloat(costPrice) || 0,
        sellPrice: parseFloat(sellPrice) || 0,
        quantity: parseInt(quantity) || 0
      });
    } else {
      Alert.alert('خطأ', 'اسم المنتج لا يمكن أن يكون فارغًا');
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.productName}
          value={name}
          onChangeText={setName}
          required
        />
        <TextInput
          style={styles.input}
          placeholder={t.costPrice}
          value={costPrice}
          onChangeText={setCostPrice}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder={t.sellPrice}
          value={sellPrice}
          onChangeText={setSellPrice}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder={t.quantity}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <View style={styles.formActions}>
          <TouchableOpacity style={styles.buttonSecondary} onPress={onCancel}>
            <Text style={styles.buttonTextSecondary}>{t.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
            <Text style={styles.buttonTextPrimary}>{t.save}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const InvoiceForm = ({ invoice, onSave, onCancel, database, settings, t }) => {
  const [type, setType] = useState(invoice?.type || 'sale');
  const [contactId, setContactId] = useState(invoice?.customerId || '');
  const [items, setItems] = useState(invoice?.items || []);
  const [notes, setNotes] = useState(invoice?.notes || '');

  const addItem = () => {
    setItems([...items, { productId: '', customName: '', quantity: 1, price: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'productId' && value) {
      const product = database.products.find(p => p.id === parseInt(value));
      if (product) {
        newItems[index].price = type === 'sale' ? product.sellPrice : product.costPrice;
        newItems[index].customName = '';
      }
    }
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmit = () => {
    if (items.length > 0) {
      const total = calculateTotal();
      const tax = total * (settings.taxRate / 100);
      onSave({
        ...invoice,
        type,
        customerId: contactId,
        items,
        notes,
        subtotal: total,
        tax,
        total: total + tax
      });
    } else {
      Alert.alert('خطأ', 'يجب إضافة عناصر إلى الفاتورة');
    }
  };

  const contacts = type === 'sale' ? database.customers : database.suppliers;

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContainer, styles.modalLarge]}>
        <Text style={styles.modalTitle}>{invoice ? 'تعديل الفاتورة' : 'إضافة فاتورة جديدة'}</Text>
        <View style={styles.formRow}>
          <Picker
            selectedValue={type}
            style={styles.picker}
            onValueChange={(itemValue) => setType(itemValue)}
          >
            <Picker.Item label="فاتورة بيع" value="sale" />
            <Picker.Item label="فاتورة شراء" value="purchase" />
          </Picker>
          <Picker
            selectedValue={contactId}
            style={styles.picker}
            onValueChange={(itemValue) => setContactId(itemValue)}
          >
            <Picker.Item label={`اختر ${type === 'sale' ? 'العميل' : 'المورد'}`} value="" />
            {contacts.map(contact => (
              <Picker.Item key={contact.id} label={contact.name} value={contact.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.sectionTitle}>{t.invoiceItems}</Text>
        <FlatList
          data={items}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item, index }) => (
            <View style={styles.invoiceItem}>
              <Picker
                selectedValue={item.productId}
                style={styles.pickerSmall}
                onValueChange={(value) => updateItem(index, 'productId', value)}
              >
                <Picker.Item label="اختر المنتج أو أدخل يدوياً" value="" />
                {database.products.map(product => (
                  <Picker.Item key={product.id} label={product.name} value={product.id} />
                ))}
              </Picker>
              <TextInput
                style={styles.inputSmall}
                placeholder="اسم المنتج (إذا لم يكن في القائمة)"
                value={item.customName}
                onChangeText={(text) => updateItem(index, 'customName', text)}
              />
              <TextInput
                style={styles.inputSmall}
                placeholder={t.quantity}
                value={String(item.quantity)}
                onChangeText={(text) => updateItem(index, 'quantity', parseInt(text) || 0)}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.inputSmall}
                placeholder={t.amount}
                value={String(item.price)}
                onChangeText={(text) => updateItem(index, 'price', parseFloat(text) || 0)}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.buttonDelete} onPress={() => removeItem(index)}>
                <Text style={styles.buttonTextPrimary}>{t.delete}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        <TouchableOpacity style={styles.buttonSecondary} onPress={addItem}>
          <Text style={styles.buttonTextSecondary}>إضافة عنصر</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textArea}
          placeholder={t.notes}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <View style={styles.invoiceTotals}>
          <Text>{t.subtotal}: {formatCurrency(calculateTotal(), settings.currency)}</Text>
          <Text>{t.tax} ({settings.taxRate}%): {formatCurrency(calculateTotal() * (settings.taxRate / 100), settings.currency)}</Text>
          <Text style={styles.finalTotal}>**{t.total}: {formatCurrency(calculateTotal() + (calculateTotal() * (settings.taxRate / 100)), settings.currency)}**</Text>
        </View>

        <View style={styles.formActions}>
          <TouchableOpacity style={styles.buttonSecondary} onPress={onCancel}>
            <Text style={styles.buttonTextSecondary}>{t.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
            <Text style={styles.buttonTextPrimary}>{t.save}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const DebtForm = ({ onSave, onCancel, contacts, type, t }) => {
  const [amount, setAmount] = useState('');
  const [contactId, setContactId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!amount || !contactId || !dueDate) {
      Alert.alert('خطأ', 'الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }

    const debt = {
      id: Date.now(),
      type,
      amount: parseFloat(amount),
      customerId: contactId,
      dueDate,
      description,
      status: 'pending',
      createdDate: new Date().toISOString()
    };

    onSave(debt);
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{type === 'receivable' ? 'إضافة مبلغ مطلوب' : 'إضافة مبلغ مستحق'}</Text>
        <Text style={styles.label}>{type === 'receivable' ? 'العميل' : 'المورد'}</Text>
        <Picker
          selectedValue={contactId}
          style={styles.picker}
          onValueChange={(itemValue) => setContactId(itemValue)}
        >
          <Picker.Item label={`اختر ${type === 'receivable' ? 'العميل' : 'المورد'}`} value="" />
          {contacts.map(contact => (
            <Picker.Item key={contact.id} label={contact.name} value={contact.id} />
          ))}
        </Picker>

        <Text style={styles.label}>{t.amount}</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="أدخل المبلغ"
          keyboardType="numeric"
          required
        />

        <Text style={styles.label}>{t.dueDate}</Text>
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>الوصف</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="وصف المبلغ"
          multiline
        />

        <View style={styles.formActions}>
          <TouchableOpacity style={styles.buttonSecondary} onPress={onCancel}>
            <Text style={styles.buttonTextSecondary}>{t.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleSubmit}>
            <Text style={styles.buttonTextPrimary}>{t.save}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// مكونات الشاشات الرئيسية (لوحة التحكم، العملاء، إلخ)
const DashboardScreen = ({ database, settings, t, formatCurrency }) => {
  const totalSales = database.invoices
    .filter(invoice => invoice.type === 'sale')
    .reduce((sum, invoice) => sum + (invoice.total || 0), 0);

  const totalPurchases = database.invoices
    .filter(invoice => invoice.type === 'purchase')
    .reduce((sum, invoice) => sum + (invoice.total || 0), 0);

  const netProfit = totalSales - totalPurchases;

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.screenTitle}>{t.dashboard}</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>{t.netProfit}</Text>
          <Text style={styles.statValue}>{formatCurrency(netProfit, settings.currency)}</Text>
          <Text style={styles.statLabel}>المبيعات - التكلفة</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>{t.totalSales}</Text>
          <Text style={styles.statValue}>{formatCurrency(totalSales, settings.currency)}</Text>
          <Text style={styles.statLabel}>من جميع الفواتير</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>{t.customersSuppliers}</Text>
          <Text style={styles.statValue}>{database.customers.length + database.suppliers.length}</Text>
          <Text style={styles.statLabel}>عدد العملاء والموردين المسجلين</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>{t.invoicesCount}</Text>
          <Text style={styles.statValue}>{database.invoices.length}</Text>
          <Text style={styles.statLabel}>إجمالي الفواتير المسجلة</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>{t.productsCount}</Text>
          <Text style={styles.statValue}>{database.products.length}</Text>
          <Text style={styles.statLabel}>عدد المنتجات في المخزون</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const CustomersScreen = ({ database, setShowCustomerForm, setEditingCustomer, setShowSupplierForm, setEditingSupplier, t }) => {
  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.screenTitle}>{t.customers}</Text>
      <View style={styles.sectionActions}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => setShowCustomerForm(true)}>
          <Text style={styles.buttonTextPrimary}>➕ {t.addCustomer}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => setShowSupplierForm(true)}>
          <Text style={styles.buttonTextPrimary}>🚚 {t.addSupplier}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>قائمة العملاء</Text>
      <FlatList
        data={database.customers}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View>
              <Text style={styles.listItemText}>{item.name}</Text>
              <Text style={styles.listItemSubText}>{item.phone}</Text>
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity 
                style={styles.buttonEdit}
                onPress={() => {
                  setEditingCustomer(item);
                  setShowCustomerForm(true);
                }}
              >
                <Text style={styles.buttonTextPrimary}>{t.edit}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonDelete} onPress={() => database.deleteCustomer(item.id)}>
                <Text style={styles.buttonTextPrimary}>{t.delete}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>قائمة الموردين</Text>
      <FlatList
        data={database.suppliers}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View>
              <Text style={styles.listItemText}>{item.name}</Text>
              <Text style={styles.listItemSubText}>{item.phone}</Text>
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity 
                style={styles.buttonEdit}
                onPress={() => {
                  setEditingSupplier(item);
                  setShowSupplierForm(true);
                }}
              >
                <Text style={styles.buttonTextPrimary}>{t.edit}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonDelete} onPress={() => database.deleteSupplier(item.id)}>
                <Text style={styles.buttonTextPrimary}>{t.delete}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
};

const InventoryScreen = ({ database, setShowProductForm, setEditingProduct, t, formatCurrency, settings }) => {
  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.screenTitle}>{t.inventory}</Text>
      <View style={styles.sectionActions}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => setShowProductForm(true)}>
          <Text style={styles.buttonTextPrimary}>➕ {t.addProduct}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>قائمة المنتجات</Text>
      <FlatList
        data={database.products}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View>
              <Text style={styles.listItemText}>{item.name}</Text>
              <Text style={styles.listItemSubText}>شراء: {formatCurrency(item.costPrice, settings.currency)} | بيع: {formatCurrency(item.sellPrice, settings.currency)} | كمية: {item.quantity}</Text>
            </View>
            <View style={styles.listItemActions}>
              <TouchableOpacity 
                style={styles.buttonEdit}
                onPress={() => {
                  setEditingProduct(item);
                  setShowProductForm(true);
                }}
              >
                <Text style={styles.buttonTextPrimary}>{t.edit}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonDelete} onPress={() => database.deleteProduct(item.id)}>
                <Text style={styles.buttonTextPrimary}>{t.delete}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
};

const InvoicesScreen = ({ database, setShowInvoiceForm, setEditingInvoice, t, formatCurrency, formatDate, settings }) => {
  const exportInvoiceToPDF = (invoice) => {
    const customer = database.customers.find(c => c.id === invoice.customerId) || 
                    database.suppliers.find(s => s.id === invoice.customerId);
    
    // This part would require a WebView or a PDF generation library for React Native
    // For simplicity, we'll just show an alert for now.
    Alert.alert(
      'تصدير PDF',
      'وظيفة تصدير الفاتورة كـ PDF غير مدعومة مباشرة في هذا الإصدار من التطبيق. يمكنك استخدام ميزة الطباعة من المتصفح إذا كنت تستخدم نسخة الويب.',
      [
        { text: 'حسناً' }
      ]
    );
  };

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.screenTitle}>{t.invoices}</Text>
      <View style={styles.sectionActions}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => setShowInvoiceForm(true)}>
          <Text style={styles.buttonTextPrimary}>➕ {t.addInvoice}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>قائمة الفواتير</Text>
      <FlatList
        data={database.invoices}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => {
          const contact = database.customers.find(c => c.id === item.customerId) || 
                          database.suppliers.find(s => s.id === item.customerId);
          return (
            <View style={styles.listItem}>
              <View>
                <Text style={styles.listItemText}>فاتورة رقم: {item.id} ({item.type === 'sale' ? 'بيع' : 'شراء'})</Text>
                <Text style={styles.listItemSubText}>التاريخ: {formatDate(item.date)} | {contact?.name || 'غير محدد'}</Text>
                <Text style={styles.listItemSubText}>المجموع: {formatCurrency(item.total, settings.currency)}</Text>
              </View>
              <View style={styles.listItemActions}>
                <TouchableOpacity 
                  style={styles.buttonEdit}
                  onPress={() => {
                    setEditingInvoice(item);
                    setShowInvoiceForm(true);
                  }}
                >
                  <Text style={styles.buttonTextPrimary}>{t.edit}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonDelete} onPress={() => database.deleteInvoice(item.id)}>
                  <Text style={styles.buttonTextPrimary}>{t.delete}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSecondary} onPress={() => exportInvoiceToPDF(item)}>
                  <Text style={styles.buttonTextSecondary}>تصدير PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </ScrollView>
  );
};

const DebtsScreen = ({ database, setShowDebtForm, setShowPayableForm, debtTab, setDebtTab, t, formatCurrency, formatDate, settings }) => {
  const markDebtAsPaid = (debtId) => {
    const debt = database.debts.find(d => d.id === debtId);
    if (debt) {
      const updatedDebt = { 
        ...debt, 
        status: 'paid', 
        paidDate: new Date().toISOString() 
      };
      database.updateDebt(updatedDebt);
    }
  };

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.screenTitle}>{t.debts}</Text>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, debtTab === 'receivables' && styles.tabButtonActive]}
          onPress={() => setDebtTab('receivables')}
        >
          <Text style={[styles.tabButtonText, debtTab === 'receivables' && styles.tabButtonTextActive]}>{t.receivables}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, debtTab === 'payables' && styles.tabButtonActive]}
          onPress={() => setDebtTab('payables')}
        >
          <Text style={[styles.tabButtonText, debtTab === 'payables' && styles.tabButtonTextActive]}>{t.payables}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, debtTab === 'payments' && styles.tabButtonActive]}
          onPress={() => setDebtTab('payments')}
        >
          <Text style={[styles.tabButtonText, debtTab === 'payments' && styles.tabButtonTextActive]}>{t.payments}</Text>
        </TouchableOpacity>
      </View>

      {debtTab === 'receivables' && (
        <View>
          <View style={styles.sectionActions}>
            <TouchableOpacity style={styles.buttonPrimary} onPress={() => setShowDebtForm(true)}>
              <Text style={styles.buttonTextPrimary}>➕ إضافة مبلغ مطلوب</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>{t.receivables}</Text>
          <FlatList
            data={database.debts.filter(debt => debt.type === 'receivable')}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => {
              const customer = database.customers.find(c => c.id === item.customerId);
              return (
                <View style={styles.listItem}>
                  <View>
                    <Text style={styles.listItemText}>{customer?.name || 'غير محدد'}</Text>
                    <Text style={styles.listItemSubText}>{formatCurrency(item.amount, settings.currency)} | {formatDate(item.dueDate)}</Text>
                    <Text style={[styles.listItemSubText, styles.statusText, styles[item.status]]}>{t[item.status]}</Text>
                  </View>
                  <View style={styles.listItemActions}>
                    {item.status === 'pending' && (
                      <TouchableOpacity style={styles.buttonEdit} onPress={() => markDebtAsPaid(item.id)}>
                        <Text style={styles.buttonTextPrimary}>تسديد</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.buttonDelete} onPress={() => database.deleteDebt(item.id)}>
                      <Text style={styles.buttonTextPrimary}>{t.delete}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}

      {debtTab === 'payables' && (
        <View>
          <View style={styles.sectionActions}>
            <TouchableOpacity style={styles.buttonPrimary} onPress={() => setShowPayableForm(true)}>
              <Text style={styles.buttonTextPrimary}>➕ إضافة مبلغ مستحق</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>{t.payables}</Text>
          <FlatList
            data={database.debts.filter(debt => debt.type === 'payable')}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => {
              const supplier = database.suppliers.find(s => s.id === item.customerId);
              return (
                <View style={styles.listItem}>
                  <View>
                    <Text style={styles.listItemText}>{supplier?.name || 'غير محدد'}</Text>
                    <Text style={styles.listItemSubText}>{formatCurrency(item.amount, settings.currency)} | {formatDate(item.dueDate)}</Text>
                    <Text style={[styles.listItemSubText, styles.statusText, styles[item.status]]}>{t[item.status]}</Text>
                  </View>
                  <View style={styles.listItemActions}>
                    {item.status === 'pending' && (
                      <TouchableOpacity style={styles.buttonEdit} onPress={() => markDebtAsPaid(item.id)}>
                        <Text style={styles.buttonTextPrimary}>دفع</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.buttonDelete} onPress={() => database.deleteDebt(item.id)}>
                      <Text style={styles.buttonTextPrimary}>{t.delete}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}

      {debtTab === 'payments' && (
        <View>
          <Text style={styles.sectionTitle}>{t.payments}</Text>
          <FlatList
            data={database.debts.filter(debt => debt.status === 'paid')}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => {
              const contact = item.type === 'receivable' 
                ? database.customers.find(c => c.id === item.customerId)
                : database.suppliers.find(s => s.id === item.customerId);
              return (
                <View style={styles.listItem}>
                  <View>
                    <Text style={styles.listItemText}>التاريخ: {formatDate(item.paidDate || item.dueDate)}</Text>
                    <Text style={styles.listItemSubText}>النوع: {item.type === 'receivable' ? 'مبلغ مطلوب' : 'مبلغ مستحق'}</Text>
                    <Text style={styles.listItemSubText}>الطرف: {contact?.name || 'غير محدد'}</Text>
                    <Text style={styles.listItemSubText}>المبلغ: {formatCurrency(item.amount, settings.currency)}</Text>
                  </View>
                  <View style={styles.listItemActions}>
                    <TouchableOpacity style={styles.buttonDelete} onPress={() => database.deleteDebt(item.id)}>
                      <Text style={styles.buttonTextPrimary}>{t.delete}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </View>
      )}
    </ScrollView>
  );
};

const SettingsScreen = ({ settings, updateSettings, t }) => {
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [companyPhone, setCompanyPhone] = useState(settings.companyPhone);
  const [companyAddress, setCompanyAddress] = useState(settings.companyAddress);
  const [taxRate, setTaxRate] = useState(String(settings.taxRate));
  const [currency, setCurrency] = useState(settings.currency);

  const handleSaveSettings = () => {
    updateSettings({
      ...settings,
      companyName,
      companyPhone,
      companyAddress,
      taxRate: parseFloat(taxRate) || 0,
      currency
    });
    Alert.alert('نجاح', 'تم حفظ الإعدادات بنجاح!');
  };

  const exportData = async () => {
    const data = {
      customers: database.customers,
      suppliers: database.suppliers,
      products: database.products,
      invoices: database.invoices,
      debts: database.debts,
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    // This would require a file system library for React Native
    Alert.alert(
      'تصدير البيانات',
      'وظيفة تصدير البيانات غير مدعومة مباشرة في هذا الإصدار من التطبيق. يمكنك استخدام ميزة التصدير من المتصفح إذا كنت تستخدم نسخة الويب.',
      [
        { text: 'حسناً' }
      ]
    );
  };

  const importData = async () => {
    // This would require a file system library for React Native
    Alert.alert(
      'استيراد البيانات',
      'وظيفة استيراد البيانات غير مدعومة مباشرة في هذا الإصدار من التطبيق. يمكنك استخدام ميزة الاستيراد من المتصفح إذا كنت تستخدم نسخة الويب.',
      [
        { text: 'حسناً' }
      ]
    );
  };

  return (
    <ScrollView style={styles.screenContainer}>
      <Text style={styles.screenTitle}>{t.settings}</Text>
      
      <View style={styles.settingsForm}>
        <Text style={styles.sectionTitle}>إعدادات النظام</Text>
        <Text style={styles.label}>{t.companyName}</Text>
        <TextInput
          style={styles.input}
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="أدخل اسم الشركة"
        />
        
        <Text style={styles.label}>{t.companyPhone}</Text>
        <TextInput
          style={styles.input}
          value={companyPhone}
          onChangeText={setCompanyPhone}
          placeholder="أدخل هاتف الشركة"
          keyboardType="phone-pad"
        />
        
        <Text style={styles.label}>{t.companyAddress}</Text>
        <TextInput
          style={styles.input}
          value={companyAddress}
          onChangeText={setCompanyAddress}
          placeholder="أدخل عنوان الشركة"
        />
        
        <Text style={styles.label}>{t.taxRate}</Text>
        <TextInput
          style={styles.input}
          value={taxRate}
          onChangeText={setTaxRate}
          placeholder="أدخل معدل الضريبة"
          keyboardType="numeric"
        />
        
        <Text style={styles.label}>{t.currency}</Text>
        <TextInput
          style={styles.input}
          value={currency}
          onChangeText={setCurrency}
          placeholder="أدخل رمز العملة"
        />
        
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleSaveSettings}>
          <Text style={styles.buttonTextPrimary}>{t.saveSettings}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dataManagement}>
        <Text style={styles.sectionTitle}>إدارة البيانات</Text>
        <View style={styles.dataActions}>
          <TouchableOpacity style={styles.buttonSecondary} onPress={exportData}>
            <Text style={styles.buttonTextSecondary}>📤 تصدير البيانات</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={importData}>
            <Text style={styles.buttonTextSecondary}>📥 استيراد البيانات</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.dataNote}>
          يمكنك تصدير جميع بيانات التطبيق لاستخدامها على جهاز آخر، أو استيراد بيانات محفوظة مسبقاً.
          (هذه الميزات متاحة حاليًا في نسخة الويب فقط).
        </Text>
      </View>

      <View style={styles.developerInfo}>
        <Text style={styles.sectionTitle}>{t.developerInfo}</Text>
        <View style={styles.developerCard}>
          <Text style={styles.developerDetailTitle}>تطوير وتصميم</Text>
          <Text style={styles.developerDetailText}>المطور: أحمد قجمي</Text>
          <Text style={styles.developerDetailText}>التقنيات المستخدمة: React Native, Expo, JavaScript</Text>
          <Text style={styles.developerDetailText}>الميزات: نظام محاسبة متكامل مع إدارة العملاء والموردين والمخزون والفواتير</Text>
          <Text style={styles.developerDetailText}>تاريخ التطوير: {new Date().getFullYear()}</Text>
          <Text style={styles.developerDetailText}>الإصدار: 1.0.0</Text>
          
          <Text style={styles.developerDetailTitle}>معلومات الاتصال</Text>
          <Text style={styles.developerDetailText}>📧 البريد الإلكتروني: ahmadalmlk807@gmail.com</Text>
          <Text style={styles.developerDetailText}>📱 واتساب: +963949371607</Text>
          <Text style={styles.developerDetailText}>💬 الدعم الفني: متاح حسب الحاجة</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default function App() {
  const { settings, updateSettings } = useSettings();
  const database = useDatabase();
  
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [showPayableForm, setShowPayableForm] = useState(false);
  const [debtTab, setDebtTab] = useState('receivables');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const t = translations[settings.language] || translations.ar;

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ ...settings, theme: newTheme });
  };

  const toggleLanguage = () => {
    const newLanguage = settings.language === 'ar' ? 'en' : 'ar';
    updateSettings({ ...settings, language: newLanguage });
  };

  useEffect(() => {
    // For React Native, we don't directly manipulate document.body or document.dir
    // Theme and language are handled via styles and i18n library if used.
  }, [settings.theme, settings.language]);

  return (
    <View style={[styles.container, settings.theme === 'dark' ? styles.darkTheme : styles.lightTheme]}>
      <StatusBar style="auto" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { /* Toggle sidebar if implemented */ }}>
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t[currentSection]}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>{settings.language === 'ar' ? '🇺🇸' : '🇸🇦'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>{settings.theme === 'light' ? '🌙' : '☀️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {currentSection === 'dashboard' && <DashboardScreen database={database} settings={settings} t={t} formatCurrency={formatCurrency} />}
        {currentSection === 'customers' && <CustomersScreen database={database} setShowCustomerForm={setShowCustomerForm} setEditingCustomer={setEditingCustomer} setShowSupplierForm={setShowSupplierForm} setEditingSupplier={setEditingSupplier} t={t} />}
        {currentSection === 'inventory' && <InventoryScreen database={database} setShowProductForm={setShowProductForm} setEditingProduct={setEditingProduct} t={t} formatCurrency={formatCurrency} settings={settings} />}
        {currentSection === 'invoices' && <InvoicesScreen database={database} setShowInvoiceForm={setShowInvoiceForm} setEditingInvoice={setEditingInvoice} t={t} formatCurrency={formatCurrency} formatDate={formatDate} settings={settings} />}
        {currentSection === 'debts' && <DebtsScreen database={database} setShowDebtForm={setShowDebtForm} setShowPayableForm={setShowPayableForm} debtTab={debtTab} setDebtTab={setDebtTab} t={t} formatCurrency={formatCurrency} formatDate={formatDate} settings={settings} />}
        {currentSection === 'settings' && <SettingsScreen settings={settings} updateSettings={updateSettings} t={t} />}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentSection('dashboard')}>
          <Text style={[styles.navButtonText, currentSection === 'dashboard' && styles.navButtonTextActive]}>🏠 {t.dashboard}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentSection('customers')}>
          <Text style={[styles.navButtonText, currentSection === 'customers' && styles.navButtonTextActive]}>👥 {t.customers}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentSection('invoices')}>
          <Text style={[styles.navButtonText, currentSection === 'invoices' && styles.navButtonTextActive]}>📄 {t.invoices}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentSection('inventory')}>
          <Text style={[styles.navButtonText, currentSection === 'inventory' && styles.navButtonTextActive]}>📦 {t.inventory}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentSection('debts')}>
          <Text style={[styles.navButtonText, currentSection === 'debts' && styles.navButtonTextActive]}>💰 {t.debts}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentSection('settings')}>
          <Text style={[styles.navButtonText, currentSection === 'settings' && styles.navButtonTextActive]}>⚙️ {t.settings}</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      {showCustomerForm && (
        <CustomerForm
          customer={editingCustomer}
          onSave={(cust) => {
            if (editingCustomer) {
              database.updateCustomer(cust);
              setEditingCustomer(null);
            } else {
              database.addCustomer(cust);
            }
            setShowCustomerForm(false);
          }}
          onCancel={() => {
            setShowCustomerForm(false);
            setEditingCustomer(null);
          }}
          t={t}
        />
      )}

      {showSupplierForm && (
        <SupplierForm
          supplier={editingSupplier}
          onSave={(supp) => {
            if (editingSupplier) {
              database.updateSupplier(supp);
              setEditingSupplier(null);
            } else {
              database.addSupplier(supp);
            }
            setShowSupplierForm(false);
          }}
          onCancel={() => {
            setShowSupplierForm(false);
            setEditingSupplier(null);
          }}
          t={t}
        />
      )}

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          onSave={(prod) => {
            if (editingProduct) {
              database.updateProduct(prod);
              setEditingProduct(null);
            } else {
              database.addProduct(prod);
            }
            setShowProductForm(false);
          }}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          t={t}
        />
      )}

      {showInvoiceForm && (
        <InvoiceForm
          invoice={editingInvoice}
          onSave={(inv) => {
            if (editingInvoice) {
              database.updateInvoice(inv);
              setEditingInvoice(null);
            } else {
              database.addInvoice(inv);
            }
            setShowInvoiceForm(false);
          }}
          onCancel={() => {
            setShowInvoiceForm(false);
            setEditingInvoice(null);
          }}
          database={database}
          settings={settings}
          t={t}
        />
      )}

      {showDebtForm && (
        <DebtForm
          onSave={(debt) => {
            database.addDebt(debt);
            setShowDebtForm(false);
          }}
          onCancel={() => setShowDebtForm(false)}
          contacts={database.customers}
          type="receivable"
          t={t}
        />
      )}

      {showPayableForm && (
        <DebtForm
          onSave={(payable) => {
            database.addDebt(payable);
            setShowPayableForm(false);
          }}
          onCancel={() => setShowPayableForm(false)}
          contacts={database.suppliers}
          type="payable"
          t={t}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: StatusBar.currentHeight || 0,
  },
  lightTheme: {
    backgroundColor: '#f8f8f8',
    color: '#333',
  },
  darkTheme: {
    backgroundColor: '#333',
    color: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#6200ee',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
  },
  headerButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  mainContent: {
    flex: 1,
    padding: 15,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  navButton: {
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 12,
    color: '#777',
  },
  navButtonTextActive: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  screenContainer: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6200ee',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  sectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  buttonPrimary: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonTextPrimary: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonSecondary: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonTextSecondary: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDelete: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonEdit: {
    backgroundColor: '#ffc107',
    padding: 8,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
    textAlign: 'right',
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listItemSubText: {
    fontSize: 14,
    color: '#666',
  },
  listItemActions: {
    flexDirection: 'row',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalLarge: {
    width: '95%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
    textAlign: 'right',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
    textAlign: 'right',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '48%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  pickerSmall: {
    height: 40,
    width: '30%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 10,
    borderRadius: 5,
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 5,
    fontSize: 14,
    width: '20%',
    textAlign: 'right',
  },
  invoiceTotals: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end',
  },
  finalTotal: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
    textAlign: 'right',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 5,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#6200ee',
  },
  tabButtonText: {
    color: '#555',
    fontWeight: 'bold',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  statusText: {
    fontWeight: 'bold',
  },
  pending: {
    color: '#ffc107',
  },
  paid: {
    color: '#28a745',
  },
  overdue: {
    color: '#dc3545',
  },
  settingsForm: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataManagement: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dataNote: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },
  developerInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  developerCard: {
    marginTop: 10,
  },
  developerDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  developerDetailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
});


