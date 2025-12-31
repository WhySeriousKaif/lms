import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import LayoutModel from "../models/layout.model";
import cloudinary from "cloudinary";

// create layout

export const createLayout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        const isTypeExist = await LayoutModel.findOne({ type });
        if(isTypeExist){
            return next(new ErrorHandler("Layout type already exists", 400));
        }

        
        if (!type) {
            return next(new ErrorHandler("Layout type is required", 400));
        }

      if(type === "Banner"){
        const { image, title, subtitle } = req.body;
            
            if (!image || !title || !subtitle) {
                return next(new ErrorHandler("Image, title, and subtitle are required for Banner", 400));
            }

        const mycloudinaryImage = await cloudinary.v2.uploader.upload(image, {
            folder: "layout",
        });
            
            const banner = {
                type: "Banner",
                banner: {
                    image: {
                public_id: mycloudinaryImage.public_id,
                url: mycloudinaryImage.secure_url,
            },
            title,
            subtitle,
                },
        };
            
        await LayoutModel.create(banner);
            
            return res.status(200).json({
                success: true,
                message: "Banner created successfully",
            });
      }
      if(type === "Faq"){
        const { faq } = req.body;
        const faqItems = faq.map((item: any) => ({
            question: item.question,
            answer: item.answer,
        }));
        await LayoutModel.create({ type: "Faq", faq: faqItems });    
        return res.status(200).json({
            success: true,
            message: "Faq created successfully",
        });
      }
      if(type === "Category"){
        const { categories } = req.body;
        const categoriesItems = categories.map((item: any) => ({
            title: item.title,
        }));
        await LayoutModel.create({ type : "Category", categories: categoriesItems });
        return res.status(200).json({
            success: true,
            message: "Category created successfully",
        });
      }
      if(type === "Layout"){
        const { faq, categories, banner } = req.body;
        await LayoutModel.create({ type, faq, categories, banner });
        return res.status(200).json({
            success: true,
            message: "Layout created successfully",
        });
      }
      else{
        return next(new ErrorHandler("Layout type not found", 404));
      }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

//edit layout
export const editLayout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body;
        
        if (!type) {
            return next(new ErrorHandler("Layout type is required", 400));
        }

        const layout = await LayoutModel.findOne({ type });
        if(!layout){
            return next(new ErrorHandler("Layout not found", 404));
        }

        if(type === "Banner"){
            const { image, title, subtitle } = req.body;
            
            if (!image || !title || !subtitle) {
                return next(new ErrorHandler("Image, title, and subtitle are required for Banner", 400));
            }

            // Delete old image from Cloudinary if it exists
            if (layout.banner?.image?.public_id) {
                await cloudinary.v2.uploader.destroy(layout.banner.image.public_id);
            }

            // Upload new image to Cloudinary
            const mycloudinaryImage = await cloudinary.v2.uploader.upload(image, {
                folder: "layout",
            });
            
            // Update banner in database
            await LayoutModel.findByIdAndUpdate(
                layout._id,
                {
                    banner: {
                        image: {
                            public_id: mycloudinaryImage.public_id,
                            url: mycloudinaryImage.secure_url,
                        },
                        title,
                        subtitle,
                    },
                },
                { new: true }
            );
            
            return res.status(200).json({
                success: true,
                message: "Banner updated successfully",
            });
        }
        
        if(type === "Faq"){
            const { faq } = req.body;
            
            if (!faq || !Array.isArray(faq)) {
                return next(new ErrorHandler("FAQ array is required", 400));
            }

            const faqItems = faq.map((item: any) => ({
                question: item.question,
                answer: item.answer,
            }));
            
            await LayoutModel.findByIdAndUpdate(
                layout._id,
                { faq: faqItems },
                { new: true }
            );
            
            return res.status(200).json({
                success: true,
                message: "FAQ updated successfully",
            });
        }
        
        if(type === "Category"){
            const { categories } = req.body;
            
            if (!categories || !Array.isArray(categories)) {
                return next(new ErrorHandler("Categories array is required", 400));
            }

            const categoriesItems = categories.map((item: any) => ({
                title: item.title,
            }));
            
            await LayoutModel.findByIdAndUpdate(
                layout._id,
                { categories: categoriesItems },
                { new: true }
            );
            
            return res.status(200).json({
                success: true,
                message: "Categories updated successfully",
            });
        }
        
        if(type === "Layout"){
            const { faq, categories, banner } = req.body;
            
            const updateData: any = {};
            if (faq) {
                updateData.faq = faq;
            }
            if (categories) {
                updateData.categories = categories;
            }
            if (banner) {
                updateData.banner = banner;
            }
            
            await LayoutModel.findByIdAndUpdate(
                layout._id,
                updateData,
                { new: true }
            );
            
            return res.status(200).json({
                success: true,
                message: "Layout updated successfully",
            });
        }
        
        return next(new ErrorHandler("Layout type not found", 404));
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

//get layout by type
export const getLayoutByType = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.params;
        
        if (!type) {
            return next(new ErrorHandler("Layout type is required", 400));
        }

        const layout = await LayoutModel.findOne({ type });
        
        if (!layout) {
            return next(new ErrorHandler("Layout not found", 404));
        }

        res.status(200).json({
            success: true,
            layout,
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});