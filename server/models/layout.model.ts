import mongoose, { Document, Schema, model } from 'mongoose';


interface FaqItem extends Document {
    question: string;
    answer: string;
}

interface Category extends Document {
    title: string;
  
}

interface BannerImage extends Document {
   public_id: string;
   url: string;
}

interface Layout extends Document {
    type: string;
    faq: FaqItem[];
    categories: Category[];
    banner: {
        image: BannerImage;
        title: string;
        subtitle: string;
    }
    
}

const faqSchema: Schema<FaqItem> = new mongoose.Schema({
    question: {
        type: String,

    },
    answer: {
        type: String,

    },
});

const categorySchema: Schema<Category> = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
});

const bannerImageSchema: Schema<BannerImage> = new mongoose.Schema({
    public_id: String,
    url: String,
});

const layoutSchema: Schema<Layout> = new mongoose.Schema({
    type: String,
    faq: [faqSchema],
    categories: [categorySchema],
    banner: {
        image: bannerImageSchema,
        title: String,
        subtitle: String,
    },
});

const LayoutModel = model<Layout>('Layout', layoutSchema);
export default LayoutModel;