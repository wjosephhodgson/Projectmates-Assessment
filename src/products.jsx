import React, { useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { createStore } from 'redux';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  Typography,
  Container
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

// Import your products data
const initialProducts = [
  {
    "productSize": "",
    "item": "DELUXE COOKED HAM",
    "plu_upc": "",
    "price": " $5.15 ",
    "productId": "102",
    "catId": "1",
    "uom": "LB"
  },
  {
    "productSize": "",
    "item": "DELUXE LOW-SODIUM COOKED HAM ",
    "plu_upc": "",
    "price": " $5.15 ",
    "productId": "159",
    "catId": "1",
    "uom": "LB"
  },
  // Add all your products here or import from Products.json
];

// Redux Action Types
const ADD_PRODUCT = 'ADD_PRODUCT';
const EDIT_PRODUCT = 'EDIT_PRODUCT';
const DELETE_PRODUCT = 'DELETE_PRODUCT';

// Redux Actions
const addProduct = (product) => ({ type: ADD_PRODUCT, payload: product });
const editProduct = (product) => ({ type: EDIT_PRODUCT, payload: product });
const deleteProduct = (productId) => ({ type: DELETE_PRODUCT, payload: productId });

// Redux Reducer
const productsReducer = (state = { products: initialProducts }, action) => {
  switch (action.type) {
    case ADD_PRODUCT:
      return {
        ...state,
        products: [...state.products, action.payload]
      };
    case EDIT_PRODUCT:
      return {
        ...state,
        products: state.products.map(p =>
          p.productId === action.payload.productId ? action.payload : p
        )
      };
    case DELETE_PRODUCT:
      return {
        ...state,
        products: state.products.filter(p => p.productId !== action.payload)
      };
    default:
      return state;
  }
};

// Create Redux Store
const store = createStore(productsReducer);

// Product Form Dialog Component
function ProductFormDialog({ open, onClose, product, isEdit }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(
    product || {
      productId: '',
      item: '',
      price: '',
      catId: '',
      uom: '',
      productSize: '',
      plu_upc: ''
    }
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (isEdit) {
      dispatch(editProduct(formData));
    } else {
      dispatch(addProduct({ ...formData, productId: Date.now().toString() }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Product Name"
            name="item"
            value={formData.item}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Category ID"
            name="catId"
            value={formData.catId}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Unit of Measure"
            name="uom"
            value={formData.uom}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Product Size"
            name="productSize"
            value={formData.productSize}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="PLU/UPC"
            name="plu_upc"
            value={formData.plu_upc}
            onChange={handleChange}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEdit ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Main Product Table Component
function ProductTable() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products);
  
  const [orderBy, setOrderBy] = useState('item');
  const [order, setOrder] = useState('asc');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[orderBy] || '';
    const bValue = b[orderBy] || '';
    
    if (order === 'asc') {
      return aValue.toString().localeCompare(bValue.toString(), undefined, { numeric: true });
    }
    return bValue.toString().localeCompare(aValue.toString(), undefined, { numeric: true });
  });

  const handleAddClick = () => {
    setEditingProduct(null);
    setOpenDialog(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setOpenDialog(true);
  };

  const handleDeleteClick = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(productId));
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Product Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'productId'}
                  direction={orderBy === 'productId' ? order : 'asc'}
                  onClick={() => handleSort('productId')}
                >
                  Product ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'item'}
                  direction={orderBy === 'item' ? order : 'asc'}
                  onClick={() => handleSort('item')}
                >
                  Item Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'price'}
                  direction={orderBy === 'price' ? order : 'asc'}
                  onClick={() => handleSort('price')}
                >
                  Price
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'catId'}
                  direction={orderBy === 'catId' ? order : 'asc'}
                  onClick={() => handleSort('catId')}
                >
                  Category
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'uom'}
                  direction={orderBy === 'uom' ? order : 'asc'}
                  onClick={() => handleSort('uom')}
                >
                  UOM
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProducts.map((product) => (
              <TableRow key={product.productId} hover>
                <TableCell>{product.productId}</TableCell>
                <TableCell>{product.item}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.catId}</TableCell>
                <TableCell>{product.uom}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleEditClick(product)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(product.productId)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ProductFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        product={editingProduct}
        isEdit={!!editingProduct}
      />
    </Container>
  );
}

// App Component
export default function App() {
  return (
    <Provider store={store}>
      <ProductTable />
    </Provider>
  );
}
