import mongoose from 'mongoose';

const projectSchema = mongoose.Schema({
    title: String,
    description: String,
    createdAt: { type: Date, default: new Date() },
});

export default mongoose.model('Project', projectSchema);