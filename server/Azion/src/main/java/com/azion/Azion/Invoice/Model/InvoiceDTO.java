package com.azion.Azion.Invoice.Model;

public class InvoiceDTO {
    private String recipientName;
    private String supplierName;
    private String invoiceNumber;
    private String date;
    private String recipientAddress;
    private String supplierAddress;
    private String totalPayment;
    private String vatAmount;
    
    
    public String getRecipientName() {
        return recipientName;
    }
    
    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }
    
    public String getSupplierName() {
        return supplierName;
    }
    
    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }
    
    public String getInvoiceNumber() {
        return invoiceNumber;
    }
    
    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }
    
    public String getDate() {
        return date;
    }
    
    public void setDate(String date) {
        this.date = date;
    }
    
    public String getRecipientAddress() {
        return recipientAddress;
    }
    
    public void setRecipientAddress(String recipientAddress) {
        this.recipientAddress = recipientAddress;
    }
    
    public String getSupplierAddress() {
        return supplierAddress;
    }
    
    public void setSupplierAddress(String supplierAddress) {
        this.supplierAddress = supplierAddress;
    }
    
    public String getTotalPayment() {
        return totalPayment;
    }
    
    public void setTotalPayment(String totalPayment) {
        this.totalPayment = totalPayment;
    }
    
    public String getVatAmount() {
        return vatAmount;
    }
    
    public void setVatAmount(String vatAmount) {
        this.vatAmount = vatAmount;
    }
    
}


