import React, { PureComponent, createContext } from "react";
import { storeProducts, detailProduct } from "./data";

const ProductContext = createContext();

const cart = JSON.parse(localStorage.getItem("cart"));

class Productprovider extends PureComponent {
  state = {
    products: [],
    detailProduct,
    cart: [],
    modalOpen: false,
    modalProduct: detailProduct,
    cartSubTotal: 0,
    cartTax: 0,
    cartTotal: 0
  };

  componentDidMount = () => {
    this.setProducts();
  };

  setProducts = () => {
    const products = this.deepCopiedProducts(storeProducts);

    this.setState(
      () => ({ products }),
      () => this.setCartAndProductsAfterPageRefresh()
    );
  };

  setCartAndProductsAfterPageRefresh = () => {
    if (cart !== null) {
      this.setState(
        () => ({ cart }),
        () => this.checkProductOfProductsInCartAfterPageRefresh()
      );
    } else {
      this.setState({ cart: [] });
    }
  };

  checkProductOfProductsInCartAfterPageRefresh = () => {
    const products = this.deepCopiedProducts(this.state.products);
    cart.forEach(item => {
      const index = products.findIndex(product => product.id === item.id);
      products[index].inCart = true;
    });
    
    this.setState(() => ({ products: products }));
    
    this.addTotals();
  };

  deepCopiedProducts = productsArray => {
    
    let tempProducts = [];
    
    productsArray.forEach(item => {
      const singleItem = { ...item };
      tempProducts = [...tempProducts, singleItem];
    });
    
    return tempProducts;
  };

  getItem = id => ({
    ...this.state.products.find(product => product.id === id)
  });

  handleDetail = id =>
    this.setState(() => ({ detailProduct: this.getItem(id) }));

  addToCart = id => {
    const { tempProducts, product } = this.updateTheProductById(id);

    this.setState(
      prevState => ({
        products: [...tempProducts],
        cart: [...prevState.cart, product]
      }),
      () => this.storeCartToLocalStorageAndCountTotalPrice()
    );
  };

  storeCartToLocalStorageAndCountTotalPrice = () => {
    localStorage.setItem("cart", JSON.stringify(this.state.cart));
    this.addTotals();
  };

  updateTheProductById = id => {
    
    let tempProducts = this.deepCopiedProducts(this.state.products);
    
    const index = tempProducts.findIndex(product => product.id === id);
    
    const product = tempProducts[index];
    product.inCart = true;
    product.count = 1;
    product.total = product.price;
    return { tempProducts, product };
  };

  openModal = id => {
    const product = this.getItem(id);
    this.setState(() => ({ modalProduct: product, modalOpen: true }));
  };

  closeModal = () => this.setState(() => ({ modalOpen: false }));

  increment = id => this.handleIncrementDecrement(id);

  decrement = id => this.handleIncrementDecrement(id, "-");

  handleIncrementDecrement = (id, operator = "") => {
    const copiedCart = this.deepCopiedProducts(this.state.cart);
    const product = copiedCart.find(item => item.id === id);
    switch (operator) {
      case "-":
        product.count = product.count !== 0 ? product.count - 1 : product.count;
        if (product.count === 0) {
          return this.removeItem(id);
        }
        break;

      default:
        product.count = product.count + 1;
        break;
    }
    product.total = product.count * product.price;

    this.setState(
      () => ({
        cart: [...copiedCart]
      }),
      () => this.storeCartToLocalStorageAndCountTotalPrice()
    );
  };

  removeItem = id => {
    const tempProducts = this.deepCopiedProducts(this.state.products);
    const filteredCart = this.state.cart.filter(item => item.id !== id);
    const product = tempProducts.find(item => item.id === id);
    product.inCart = false;
    product.count = 0;
    product.total = 0;

    this.setState(
      { cart: [...filteredCart], products: [...tempProducts] },
      () => this.storeCartToLocalStorageAndCountTotalPrice()
    );
  };

  clearCart = () => {
    localStorage.removeItem("cart");
    this.setState({ cart: [] }, () => {
      this.setProducts();
      this.addTotals();
    });
  };

  addTotals = () => {
    const cartSubTotal = this.state.cart.reduce(
      (acc, curr) => acc + curr.total,
      0
    );
    const tempTax = cartSubTotal * process.env.REACT_APP_TAX;
    const cartTax = parseFloat(tempTax.toFixed(2));
    const cartTotal = cartSubTotal + cartTax;
    this.setState({ cartSubTotal, cartTax, cartTotal });
  };

  render() {
    return (
      <ProductContext.Provider
        value={{
          ...this.state,
          handleDetail: this.handleDetail,
          addToCart: this.addToCart,
          openModal: this.openModal,
          closeModal: this.closeModal,
          increment: this.increment,
          decrement: this.decrement,
          removeItem: this.removeItem,
          clearCart: this.clearCart
        }}
      >
        {this.props.children}
      </ProductContext.Provider>
    );
  }
}

const ProductConsumer = ProductContext.Consumer;

export { Productprovider, ProductConsumer };
