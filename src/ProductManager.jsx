//////////////////////////////////////////////////////////////
// DEPS
//////////////////////////////////////////////////////////////
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
  Chip,
  createTheme,
  ThemeProvider,
  CssBaseline
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantIcon from '@mui/icons-material/Restaurant';

// Import products data
import productsData from './Products.json';



//////////////////////////////////////////////////////////////
// Material UI styles
//////////////////////////////////////////////////////////////

// Create dark theme similar to MUI Dashboard template
const applicationTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#ce93d8',
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});


//////////////////////////////////////////////////////////////
// Functions
//////////////////////////////////////////////////////////////

// Utility function to remove duplicate products with same productId
const removeDuplicateProducts = (productList) => {
  const seenIds = new Map();
  return productList.filter(item => {
    if (seenIds.has(item.productId)) {
      console.warn(`Duplicate productId found: ${item.productId} - "${item.item}"`);
      return false;
    }
    seenIds.set(item.productId, true);
    return true;
  });
};

const cleanedProductList = removeDuplicateProducts(productsData);

// Redux Toolkit Slice
const inventorySlice = createSlice({
  name: 'inventory',
  initialState: { items: cleanedProductList },
  reducers: {
    createProduct: (state, action) => {
      state.items.push(action.payload);
    },
    updateProduct: (state, action) => {
      const position = state.items.findIndex(item => item.productId === action.payload.productId);
      if (position !== -1) {
        state.items[position] = action.payload;
      }
    },
    removeProduct: (state, action) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
    }
  }
});

const { createProduct, updateProduct, removeProduct } = inventorySlice.actions;

// Create Redux Store
const appStore = configureStore({
  reducer: inventorySlice.reducer
});

// Product Form Modal Component with Validation
function ProductFormModal({ isOpen, onDismiss, productData, isEditMode }) {
  const dispatcher = useDispatch();
  const [formFields, setFormFields] = useState(
    productData || {
      productId: '',
      item: '',
      price: '',
      catId: '',
      uom: '',
      productSize: '',
      plu_upc: ''
    }
  );
  const [validationErrors, setValidationErrors] = useState({});

  // Update formFields when productData changes (for edit mode)
  React.useEffect(() => {
    if (productData) {
      setFormFields(productData);
    } else {
      setFormFields({
        productId: '',
        item: '',
        price: '',
        catId: '',
        uom: '',
        productSize: '',
        plu_upc: ''
      });
    }
    setValidationErrors({});
  }, [productData, isOpen]);

  const handleFieldChange = (event) => {
    setFormFields({ ...formFields, [event.target.name]: event.target.value });
    // Clear error when user starts typing
    if (validationErrors[event.target.name]) {
      setValidationErrors({ ...validationErrors, [event.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formFields.item.trim()) {
      errors.item = 'Product name is required';
    }
    
    if (!formFields.price.trim()) {
      errors.price = 'Price is required';
    } else {
      const numericPrice = parseFloat(formFields.price.replace(/[^0-9.]/g, ''));
      if (isNaN(numericPrice) || numericPrice <= 0) {
        errors.price = 'Price must be a valid number greater than 0';
      }
    }
    
    if (!formFields.catId.trim()) {
      errors.catId = 'Category ID is required';
    }
    
    if (!formFields.uom.trim()) {
      errors.uom = 'Unit of measure is required';
    }

    return errors;
  };

  const handleFormSubmit = () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Format price consistently
    const cleanedPrice = formFields.price.replace(/[^0-9.]/g, '');
    const standardizedPrice = `$${parseFloat(cleanedPrice).toFixed(2)}`;

    if (isEditMode) {
      dispatcher(updateProduct({ ...formFields, price: standardizedPrice }));
    } else {
      dispatcher(createProduct({ 
        ...formFields, 
        price: standardizedPrice,
        productId: Date.now().toString() 
      }));
    }
    onDismiss();
    setValidationErrors({});
  };

//////////////////////////////////////////////////////////////
// Edit/delete modal
//////////////////////////////////////////////////////////////
  return (
    <Dialog open={isOpen} onClose={onDismiss} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Product Name"
            name="item"
            value={formFields.item}
            onChange={handleFieldChange}
            fullWidth
            required
            error={!!validationErrors.item}
            helperText={validationErrors.item}
          />
          <TextField
            label="Price"
            name="price"
            value={formFields.price}
            onChange={handleFieldChange}
            fullWidth
            required
            error={!!validationErrors.price}
            helperText={validationErrors.price}
            placeholder="5.15"
          />
          <TextField
            label="Category ID"
            name="catId"
            value={formFields.catId}
            onChange={handleFieldChange}
            fullWidth
            required
            error={!!validationErrors.catId}
            helperText={validationErrors.catId}
          />
          <TextField
            label="Unit of Measure"
            name="uom"
            value={formFields.uom}
            onChange={handleFieldChange}
            fullWidth
            required
            error={!!validationErrors.uom}
            helperText={validationErrors.uom}
            placeholder="LB, EA, CS"
          />
          <TextField
            label="Product Size"
            name="productSize"
            value={formFields.productSize}
            onChange={handleFieldChange}
            fullWidth
          />
          <TextField
            label="PLU/UPC"
            name="plu_upc"
            value={formFields.plu_upc}
            onChange={handleFieldChange}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDismiss}>Cancel</Button>
        <Button onClick={handleFormSubmit} variant="contained" color="primary">
          {isEditMode ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

//////////////////////////////////////////////////////////////
// Alt mobile view with cards
//////////////////////////////////////////////////////////////

// Mobile Card View Component
function InventoryCard({ itemData, onModify, onRemove }) {
  return (
    <Card sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 500 }}>
          {itemData.item}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip label={`ID: ${itemData.productId}`} size="small" variant="outlined" />
          <Chip label={`Cat: ${itemData.catId}`} size="small" color="primary" variant="outlined" />
          <Chip label={itemData.uom} size="small" color="secondary" variant="outlined" />
        </Box>
        <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
          {itemData.price}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <IconButton color="primary" onClick={() => onModify(itemData)} size="small">
          <EditIcon />
        </IconButton>
        <IconButton color="error" onClick={() => onRemove(itemData.productId)} size="small">
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
}


//////////////////////////////////////////////////////////////
// Product table rendering and manipulation
//////////////////////////////////////////////////////////////
function InventoryDataGrid() {
  const dispatcher = useDispatch();
  const inventoryItems = useSelector((state) => state.items);
  const currentTheme = useTheme();
  const isMobileView = useMediaQuery(currentTheme.breakpoints.down('md'));
  
  const [sortColumn, setSortColumn] = useState('item');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [chosenCategory, setChosenCategory] = useState('');

  // Get unique categories
  const availableCategories = useMemo(() => {
    const categorySet = [...new Set(inventoryItems.map(item => item.catId))].filter(Boolean);
    return categorySet.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [inventoryItems]);

  // Filter products based on search and category
  const matchingItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesFilter = item.item.toLowerCase().includes(filterText.toLowerCase()) ||
                           item.productId.includes(filterText) ||
                           item.price.includes(filterText);
      
      const matchesCategory = chosenCategory === '' || item.catId === chosenCategory;
      
      return matchesFilter && matchesCategory;
    });
  }, [inventoryItems, filterText, chosenCategory]);

  // Sort products
  const orderedItems = useMemo(() => {
    const sorted = [...matchingItems].sort((itemA, itemB) => {
      const valueA = itemA[sortColumn] || '';
      const valueB = itemB[sortColumn] || '';
      
      if (sortDirection === 'asc') {
        return valueA.toString().localeCompare(valueB.toString(), undefined, { numeric: true });
      }
      return valueB.toString().localeCompare(valueA.toString(), undefined, { numeric: true });
    });
    return sorted;
  }, [matchingItems, sortColumn, sortDirection]);

  // Paginate products
  const displayedItems = useMemo(() => {
    return orderedItems.slice(
      currentPage * itemsPerPage,
      currentPage * itemsPerPage + itemsPerPage
    );
  }, [orderedItems, currentPage, itemsPerPage]);

  const handleColumnSort = (columnName) => {
    const isAscending = sortColumn === columnName && sortDirection === 'asc';
    setSortDirection(isAscending ? 'desc' : 'asc');
    setSortColumn(columnName);
  };

  const handlePageUpdate = (event, newPageNumber) => {
    setCurrentPage(newPageNumber);
  };

  const handleRowsPerPageUpdate = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  const handleCreateClick = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleModifyClick = (productItem) => {
    setSelectedProduct(productItem);
    setShowModal(true);
  };

  const handleRemoveClick = (itemId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatcher(removeProduct(itemId));
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleFilterUpdate = (event) => {
    setFilterText(event.target.value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handleCategoryUpdate = (event) => {
    setChosenCategory(event.target.value);
    setCurrentPage(0); // Reset to first page when filtering
  };

//////////////////////////////////////////////////////////////
// Table html8
//////////////////////////////////////////////////////////////
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 2 
      }}>
        <Box sx={{
          display:'flex',
          flexWrap: 'nowrap',
          alignItems:'center',
          gap: 1,

        }}>
          <RestaurantIcon sx={{
            fontSize:31
          }}/>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Product Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
          sx={{ 
            textTransform: 'none',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
            }
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* Search and Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <TextField
              sx={{ width: 300 }}
              label="Search Products"
              variant="outlined"
              value={filterText}
              onChange={handleFilterUpdate}
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
          <Grid item>
            <FormControl sx={{ width: 200 }}>
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={chosenCategory}
                onChange={handleCategoryUpdate}
                label="Filter by Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {availableCategories.map(category => (
                  <MenuItem key={category} value={category}>
                    Category {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {displayedItems.length} of {matchingItems.length} products
            {matchingItems.length !== inventoryItems.length && ` (filtered from ${inventoryItems.length} total)`}
          </Typography>
          {(filterText || chosenCategory) && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setFilterText('');
                setChosenCategory('');
              }}
              sx={{ textTransform: 'none' }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Paper>

      {/* Mobile View - Cards */}
      {isMobileView ? (
        <Box>
          {displayedItems.map((item, position) => (
            <InventoryCard
              key={`${item.productId}-${position}`}
              itemData={item}
              onModify={handleModifyClick}
              onRemove={handleRemoveClick}
            />
          ))}
        </Box>
      ) : (
        /* Desktop View - Table */
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === 'productId'}
                    direction={sortColumn === 'productId' ? sortDirection : 'asc'}
                    onClick={() => handleColumnSort('productId')}
                  >
                    Product ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === 'item'}
                    direction={sortColumn === 'item' ? sortDirection : 'asc'}
                    onClick={() => handleColumnSort('item')}
                  >
                    Item Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === 'price'}
                    direction={sortColumn === 'price' ? sortDirection : 'asc'}
                    onClick={() => handleColumnSort('price')}
                  >
                    Price
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === 'catId'}
                    direction={sortColumn === 'catId' ? sortDirection : 'asc'}
                    onClick={() => handleColumnSort('catId')}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === 'uom'}
                    direction={sortColumn === 'uom' ? sortDirection : 'asc'}
                    onClick={() => handleColumnSort('uom')}
                  >
                    UOM
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedItems.map((item, position) => (
                <TableRow key={`${item.productId}-${position}`} hover>
                  <TableCell>{item.productId}</TableCell>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell>{item.catId}</TableCell>
                  <TableCell>{item.uom}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleModifyClick(item)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveClick(item.productId)}
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
        count={matchingItems.length}
        page={currentPage}
        onPageChange={handlePageUpdate}
        rowsPerPage={itemsPerPage}
        onRowsPerPageChange={handleRowsPerPageUpdate}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />

      <ProductFormModal
        isOpen={showModal}
        onDismiss={handleModalClose}
        productData={selectedProduct}
        isEditMode={!!selectedProduct}
      />
    </Container>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={applicationTheme}>
      <CssBaseline />
      <Provider store={appStore}>
        <InventoryDataGrid />
      </Provider>
    </ThemeProvider>
  );
}
