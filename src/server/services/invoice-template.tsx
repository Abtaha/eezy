import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  section: { marginBottom: 10 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
    paddingTop: 5,
  },
  cellName: { width: "50%" },
  cellQty: { width: "15%", textAlign: "center" },
  cellPrice: { width: "15%", textAlign: "right" },
  cellTotal: { width: "20%", textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    marginTop: 10,
    borderTopWidth: 1,
    borderColor: "#000",
    paddingTop: 5,
  },
});

interface InvoiceProps {
  orderId: string;
  date: Date;
  address: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  total: number;
}

export const InvoiceTemplate = ({
  orderId,
  date,
  address,
  items,
  total,
}: InvoiceProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>INVOICE</Text>

      <View style={styles.section}>
        <Text>Order ID: {orderId}</Text>
        <Text>Date: {date.toLocaleDateString()}</Text>
        <Text>Shipping Address: {address}</Text>
      </View>

      <View style={styles.section}>
        <View style={[styles.row, { borderBottomWidth: 2 }]}>
          <Text style={styles.cellName}>Product</Text>
          <Text style={styles.cellQty}>Qty</Text>
          <Text style={styles.cellPrice}>Price</Text>
          <Text style={styles.cellTotal}>Total</Text>
        </View>

        {items.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.cellName}>{item.name}</Text>
            <Text style={styles.cellQty}>{item.quantity}</Text>
            <Text style={styles.cellPrice}>${item.price.toFixed(2)}</Text>
            <Text style={styles.cellTotal}>${item.subtotal.toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text
            style={{ width: "80%", textAlign: "right", fontWeight: "bold" }}
          >
            Grand Total:
          </Text>
          <Text style={styles.cellTotal}>${total.toFixed(2)}</Text>
        </View>
      </View>
    </Page>
  </Document>
);
