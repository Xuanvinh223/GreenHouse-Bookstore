package com.greenhouse.repository;

import com.greenhouse.model.Product_Detail;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductDetailRepository extends JpaRepository<Product_Detail, Integer> {

        @Query(value = "SELECT " +
                        "    p.Product_Id AS ID, " +
                        "    p.Product_Name AS 'Tên sản phẩm', " +
                        "    pd.Quantity_In_Stock AS 'Số lượng tồn kho', " +
                        "    iid.Price AS 'Giá nhập', " +
                        "    pd.Price_discount AS 'Giá bán', " +
                        "    p.Status AS 'Trạng thái tồn kho', " +
                        "    b.Brand_Name AS 'Tên thương hiệu', " +
                        "    p.Manufacture_Date AS 'Ngày sản xuất', " +
                        "    ii.Create_Date AS 'Ngày nhập kho', " +
                        "    s.Supplier_Name AS 'Nhà cung cấp', " +
                        "    DATEDIFF(day, ii.Create_Date, GETDATE()) AS 'Thời gian tồn tại', " +
                        "    SUM(id.Quantity) AS 'Số lượng bán ra', " +
                        "    SUM(id.Quantity * pd.Price) AS 'Tổng giá nhập', " +
                        "    SUM(id.Quantity * pd.Price_discount) AS 'Doanh số bán ra', " +
                        "    SUM(id.Quantity * pd.Price_discount) - SUM(id.Quantity * iid.Price) AS 'Lợi nhuận' " +
                        "FROM Products p " +
                        "INNER JOIN Product_Detail pd ON p.Product_Id = pd.Product_Id " +
                        "INNER JOIN Import_Invoice_Detail iid ON pd.Product_Detail_Id = iid.Product_Detail_Id " +
                        "INNER JOIN Import_Invoice ii ON iid.Import_Invoice_Id = ii.Import_Invoice_Id " +
                        "INNER JOIN Suppliers s ON ii.Supplier_Id = s.Supplier_Id " +
                        "INNER JOIN Brands b ON p.Brand_Id = b.Brand_Id " +
                        "LEFT JOIN Invoice_Details id ON pd.Product_Detail_Id = id.Product_Detail_Id " +
                        "GROUP BY " +
                        "    p.Product_Id, " +
                        "    p.Product_Name, " +
                        "    pd.Quantity_In_Stock, " +
                        "    iid.Price, " +
                        "    pd.Price_discount, " +
                        "    p.Status, " +
                        "    b.Brand_Name, " +
                        "    p.Manufacture_Date, " +
                        "    ii.Create_Date, " +
                        "    s.Supplier_Name", nativeQuery = true)
        List<Object[]> findAllInventoryList();

        // Các phương thức truy vấn tùy chỉnh (nếu cần) có thể được thêm vào đây.
        @Query(value = "SELECT " +
                        "    p.Product_Id AS ID, " +
                        "    p.Product_Name AS 'Tên sản phẩm', " +
                        "    pd.Quantity_In_Stock AS 'Số lượng tồn kho', " +
                        "    iid.Price AS 'Giá nhập', " +
                        "    pd.Price_discount AS 'Giá bán', " +
                        "    p.Status AS 'Trạng thái tồn kho', " +
                        "    b.Brand_Name AS 'Tên thương hiệu', " +
                        "    p.Manufacture_Date AS 'Ngày sản xuất', " +
                        "    ii.Create_Date AS 'Ngày nhập kho', " +
                        "    s.Supplier_Name AS 'Nhà cung cấp', " +
                        "    DATEDIFF(day, ii.Create_Date, GETDATE()) AS 'Thời gian tồn tại', " +
                        "    SUM(id.Quantity) AS 'Số lượng bán ra', " +
                        "    SUM(id.Quantity * pd.Price) AS 'Tổng giá nhập', " +
                        "    SUM(id.Quantity * pd.Price_discount) AS 'Doanh số bán ra', " +
                        "    SUM(id.Quantity * pd.Price_discount) - SUM(id.Quantity * iid.Price) AS 'Lợi nhuận' " +
                        "FROM Products p " +
                        "INNER JOIN Product_Detail pd ON p.Product_Id = pd.Product_Id " +
                        "INNER JOIN Import_Invoice_Detail iid ON pd.Product_Detail_Id = iid.Product_Detail_Id " +
                        "INNER JOIN Import_Invoice ii ON iid.Import_Invoice_Id = ii.Import_Invoice_Id " +
                        "INNER JOIN Suppliers s ON ii.Supplier_Id = s.Supplier_Id " +
                        "INNER JOIN Brands b ON p.Brand_Id = b.Brand_Id " +
                        "LEFT JOIN Invoice_Details id ON pd.Product_Detail_Id = id.Product_Detail_Id " +
                        "GROUP BY " +
                        "    p.Product_Id, " +
                        "    p.Product_Name, " +
                        "    pd.Quantity_In_Stock, " +
                        "    iid.Price, " +
                        "    pd.Price_discount, " +
                        "    p.Status, " +
                        "    b.Brand_Name, " +
                        "    p.Manufacture_Date, " +
                        "    ii.Create_Date, " +
                        "    s.Supplier_Name " +
                        "ORDER BY " +
                        "    pd.Quantity_In_Stock DESC", nativeQuery = true)
        List<Object[]> findAllInventoryListDesc();

        @Query(value = "SELECT p.Product_Id, p.Product_Name, pd.Image, id.Quantity AS Quantity_Invoice, pd.Price AS Product_Price, pd.Price_Discount AS Product_Discount, id.Amount "
                        +
                        "FROM Product_Detail AS pd " +
                        "JOIN Products AS p ON pd.Product_Id = p.Product_Id " +
                        "JOIN Invoice_Details AS id ON pd.Product_Detail_Id = id.Product_Detail_Id " +
                        "WHERE id.Invoice_Id = :id", nativeQuery = true)
        List<Object[]> getInvoiceDetails(@Param("id") Integer id);

        @Query(value = "SELECT d.* FROM Product_Detail d join Products p on d.Product_Id = p.Product_Id " +
                        "WHERE p.Status = 1", nativeQuery = true)
        List<Product_Detail> findProductsByStatus();

    List<Product_Detail> findProductDetailsByProduct_Brand_BrandId(String brandId);

    @Query(value = "SELECT d.* FROM Product_Detail d " +
            "JOIN Products p ON d.Product_Id = p.Product_Id " +
            "JOIN Product_Category c ON p.Product_Id = c.Product_Id " +
            "WHERE c.Category_Id IN " +
            "(SELECT Category_Id FROM Product_Category WHERE Product_Id = " +
            "(SELECT Product_Id FROM Product_Detail WHERE Product_Detail_Id = ?1))", nativeQuery = true)
    List<Product_Detail> findRelatedProducts(int productDetailId);

    @Query(value = "SELECT pd.* " +
            "FROM Product_Category pc " +
            "INNER JOIN Products p ON pc.Product_Id = p.Product_Id " +
            "INNER JOIN Product_Detail pd ON p.Product_Id = pd.Product_Id " +
            "WHERE pc.Category_Id = :categoryId", nativeQuery = true)
    List<Product_Detail> findAllCate(@Param("categoryId") String categoryId);
}
