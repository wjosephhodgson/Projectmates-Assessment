import React, { useState, useMemo } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
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
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

// Import your products data
// import productsData from './Products.json';

// Utility function to deduplicate products with same productId
const deduplicateProducts = (products) => {
  const seen = new Map();
  return products.filter(product => {
    if (seen.has(product.productId)) {
      console.warn(`Duplicate productId found: ${product.productId} - "${product.item}"`);
      return false;
    }
    seen.set(product.productId, true);
    return true;
  });
};

const initialProducts = deduplicateProducts([
  {
    "productSize": "",
    "item": "DELUXE COOKED HAM",
    "plu_upc": "",
    "price": "$5.15",
    "productId": "102",
    "catId": "1",
    "uom": "LB"
  },
  {
    "productSize": "",
    "item": "DELUXE LOW-SODIUM COOKED HAM",
    "plu_upc": "",
    "price": "$5.15",
    "productId": "159",
    "catId": "1",
    "uom": "LB"
  },
  // Add all your products here or import from Products.json
  // Then use: const initialProducts = deduplicateProducts(productsData);
  
  // Note: Your Products.json has duplicate productIds (e.g., productId "11018" 
  // appears for both "DELI SWEET SLICE SMOKED HAM" and "SUNDAY HOT HAM").
  // The deduplicateProducts function will keep only the first occurrence.
]);

// Redux Toolkit Slice
const productsSlice = createSlice({
  name: 'products',
  initialState: { products: initialProducts },
  reducers: {
    addProduct: (state, action) => {
      state.products.push(action.payload);
    },
    editProduct: (state, action) => {
      const index = state.products.findIndex(p => p.productId === action.payload.productId);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter(p => p.productId !== action.payload);
    }
  }
});

const { addProduct, editProduct, deleteProduct } = productsSlice.actions;

// Create Redux Store
const store = configureStore({
  reducer: productsSlice.reducer
});

// Product Form Dialog Component with Validation
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
  const [errors, setErrors] = useState({});

  // Update formData when product changes (for edit mode)
  React.useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        productId: '',
        item: '',
        price: '',
        catId: '',
        uom: '',
        productSize: '',
        plu_upc: ''
      });
    }
    setErrors({});
  }, [product, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.item.trim()) {
      newErrors.item = 'Product name is required';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price.replace(/[^0-9.]/g, ''));
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be a valid number greater than 0';
      }
    }
    
    if (!formData.catId.trim()) {
      newErrors.catId = 'Category ID is required';
    }
    
    if (!formData.uom.trim()) {
      newErrors.uom = 'Unit of measure is required';
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Format price consistently
    const cleanPrice = formData.price.replace(/[^0-9.]/g, '');
    const formattedPrice = `$${parseFloat(cleanPrice).toFixed(2)}`;

    if (isEdit) {
      dispatch(editProduct({ ...formData, price: formattedPrice }));
    } else {
      dispatch(addProduct({ 
        ...formData, 
        price: formattedPrice,
        productId: Date.now().toString() 
      }));
    }
    onClose();
    setErrors({});
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
            error={!!errors.item}
            helperText={errors.item}
          />
          <TextField
            label="Price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.price}
            helperText={errors.price}
            placeholder="5.15"
          />
          <TextField
            label="Category ID"
            name="catId"
            value={formData.catId}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.catId}
            helperText={errors.catId}
          />
          <TextField
            label="Unit of Measure"
            name="uom"
            value={formData.uom}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.uom}
            helperText={errors.uom}
            placeholder="LB, EA, CS"
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

// Mobile Card View Component
function ProductCard({ product, onEdit, onDelete }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {product.item}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip label={`ID: ${product.productId}`} size="small" />
          <Chip label={`Cat: ${product.catId}`} size="small" color="primary" />
          <Chip label={product.uom} size="small" color="secondary" />
        </Box>
        <Typography variant="h5" color="primary">
          {product.price}
        </Typography>
      </CardContent>
      <CardActions>
        <IconButton color="primary" onClick={() => onEdit(product)} size="small">
          <EditIcon />
        </IconButton>
        <IconButton color="error" onClick={() => onDelete(product.productId)} size="small">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}

// Main Product Table Component
function ProductTable() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [orderBy, setOrderBy] = useState('item');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.catId))].filter(Boolean);
    return cats.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.productId.includes(searchTerm) ||
                           product.price.includes(searchTerm);
      
      const matchesCategory = selectedCategory === '' || product.catId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts].sort((a, b) => {
      const aValue = a[orderBy] || '';
      const bValue = b[orderBy] || '';
      
      if (order === 'asc') {
        return aValue.toString().localeCompare(bValue.toString(), undefined, { numeric: true });
      }
      return bValue.toString().localeCompare(aValue.toString(), undefined, { numeric: true });
    });
    return sorted;
  }, [filteredProducts, orderBy, order]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    return sortedProducts.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [sortedProducts, page, rowsPerPage]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPage(0); // Reset to first page when filtering
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
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

      {/* Search and Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Products"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name, ID, or price..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Filter by Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>
                    Category {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedProducts.length} of {filteredProducts.length} products
            {filteredProducts.length !== products.length && ` (filtered from ${products.length} total)`}
          </Typography>
          {(searchTerm || selectedCategory) && (
            <Button
              size="small"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Paper>

      {/* Mobile View - Cards */}
      {isMobile ? (
        <Box>
          {paginatedProducts.map((product, index) => (
            <ProductCard
              key={`${product.productId}-${index}`}
              product={product}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </Box>
      ) : (
        /* Desktop View - Table */
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
              {paginatedProducts.map((product, index) => (
                <TableRow key={`${product.productId}-${index}`} hover>
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
      )}

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredProducts.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />

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
