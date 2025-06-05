import { useNavigate } from "react-router-dom";
import { Carousel } from "@material-tailwind/react";
import ProductComponent from "../../components/ProductComponent/ProductComponent";
import AnimationScroll from "../../components/AnimationScroll/AnimationScroll";
import { useAuth } from "../../context/AuthContext";
import { useProduct } from "../../context/ProductContext";
import { useEffect } from "react";
import { useState } from "react";
import { getFavourite } from "../../services/api/FavouriteApi";
import { useUser } from "../../context/UserContext";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import { getDetailStore } from "../../services/api/StoreApi";
import {
  getRecommendedProducts,
  getDetailsProduct,
} from "../../services/api/ProductApi";

const HomePage = () => {
  const storeId = import.meta.env.VITE_STORE_ID;
  const navigate = useNavigate();
  const { products, fetchProducts } = useProduct();
  const [productFamous, setProductFamous] = useState([]);
  const [productSelled, setProductSelled] = useState([]);
  const { fetchUser, selectedUser } = useUser();
  const [productNew, setProductNew] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  const [favourites, setFavourites] = useState([]);
  const { token } = useAuth();
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanner = async () => {
      const res = await getDetailStore(storeId);
      if (res?.EC === 0 && res?.EM) {
        const { storeBanner } = res.result;
        setBanners(storeBanner);
      }
    };

    fetchBanner();
  }, []);

  useEffect(() => {
    const fetchRecommendedDetails = async () => {
      if (token && selectedUser?.id) {
        const productDetails = await getRecommendedProducts(selectedUser.id);

        setRecommendedProducts(productDetails.result);
      }
    };

    fetchRecommendedDetails();
  }, [selectedUser?.id]);

  const fetchFavourites = async () => {
    if (token) {
      const res = await getFavourite();
      if (res?.EC === 0) {
        setFavourites(res.result);
      }
    }
  };

  // Gọi khi component mount hoặc khi token thay đổi
  useEffect(() => {
    if (token) {
      fetchUser();
      fetchFavourites();
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const productsToShow = windowWidth > 1280 ? 8 : 6;

  useEffect(() => {
    const productFamous = products.filter(
      (product) => product.productFamous === true
    );

    const productSelled = products.filter(
      (product) => product.productSelled >= 10
    );

    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 ngày tính bằng milliseconds
    const now = Date.now();

    const productNew = products.filter((product) => {
      const createdDate = new Date(product.createdAt).getTime();
      return now - createdDate <= SEVEN_DAYS;
    });

    setProductFamous(productFamous);
    setProductSelled(productSelled);
    setProductNew(productNew);
  }, [products]);

  const productsStatus = [
    {
      name: "Sản phẩm nổi bật",
      products: productFamous,
    },
    {
      name: "Sản phẩm bán chạy",
      products: productSelled,
    },
    {
      name: "Sản phẩm mới về",
      products: productNew,
    },
  ];

  return (
    <div className="">
      <div className="container mx-auto my-6 px-2">
        <Carousel
          className="h-[200px] md:h-[300px] lg:h-[400px] w-full"
          navigation={({ setActiveIndex, activeIndex, length }) => (
            <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
              {new Array(length).fill("")?.map((_, i) => (
                <span
                  key={i}
                  className={`block h-1 cursor-pointer rounded-2xl transition-all ${
                    activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
                  }`}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          )}
          loop
          autoplay
        >
          {banners?.map((slide, index) => (
            <div
              key={index}
              className="w-full h-full flex items-center justify-center"
            >
              <img
                src={slide}
                alt={`Slide ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </Carousel>
        <div>
          {recommendedProducts?.length > 0 && (
            <div className="border-t-2 border-[rgba(0, 0, 0, 0.1)] w-full my-8">
              <p className="uppercase text-4xl font-extrabold text-center my-8">
                Có thể bạn sẽ thích
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {recommendedProducts
                  ?.slice(0, productsToShow) 
                  .map((product) => (
                    <AnimationScroll
                      key={product?.id}
                      type="fadeUp"
                      delay={0.1}
                    >
                      <ProductComponent
                        item={product}
                        favourites={favourites}
                        onFavouriteChange={fetchFavourites}
                        onClick={() => navigate(`/product/${product?.id}`)}
                      />
                    </AnimationScroll>
                  ))}
              </div>
            </div>
          )}
        </div>
        <div>
          {productsStatus?.map((productStatus, index) => {
            return (
              <div
                key={index}
                className="border-t-2 border-[rgba(0, 0, 0, 0.1)] w-full my-8"
              >
                <p className="uppercase text-4xl font-extrabold text-center my-8">
                  {productStatus.name}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {productStatus.products
                    .slice(0, productsToShow)
                    .map((product) => (
                      <AnimationScroll
                        key={product.id}
                        type="fadeUp"
                        delay={0.1}
                      >
                        <ProductComponent
                          item={product}
                          favourites={favourites}
                          onFavouriteChange={fetchFavourites}
                          onClick={() => navigate(`/product/${product.id}`)} // Chuyển đến trang chi tiết sản phẩm
                        />
                      </AnimationScroll>
                    ))}
                </div>
                <div className="flex justify-center mt-6">
                  <ButtonComponent
                    color="white"
                    onClick={() => {
                      const queryMap = ["famous", "selled", "new"];
                      navigate(`/product?type=${queryMap[index]}`);
                    }}
                    className="w-[200px]"
                  >
                    Xem thêm
                  </ButtonComponent>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
