import React from "react";
import '@/styles/components/ui/Table.css';

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="table-container">
    <table
      ref={ref}
      className={`table ${className || ''}`}
      {...props}
    />
  </div>
));

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={`table-header ${className || ''}`} {...props} />
));

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={`table-body ${className || ''}`} {...props} />
));

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={`table-footer ${className || ''}`} {...props} />
));

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr ref={ref} className={`table-row ${className || ''}`} {...props} />
));

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th ref={ref} className={`table-head ${className || ''}`} {...props} />
));

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={`table-cell ${className || ''}`} {...props} />
));

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption ref={ref} className={`table-caption ${className || ''}`} {...props} />
));

Table.displayName = "Table";
TableHeader.displayName = "TableHeader";
TableBody.displayName = "TableBody";
TableFooter.displayName = "TableFooter";
TableHead.displayName = "TableHead";
TableRow.displayName = "TableRow";
TableCell.displayName = "TableCell";
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};