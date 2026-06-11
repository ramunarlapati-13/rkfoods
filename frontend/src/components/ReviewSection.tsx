'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Review, Product } from '@/lib/types';
import { FiStar, FiUpload, FiImage, FiVideo, FiMic, FiCheck, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  onReviewSubmitted: () => void;
}

export default function ReviewSection({ product, onReviewSubmitted }: Props) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Form states
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);

  // Selected media files
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setReviews((data || []).map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        userId: r.user_id,
        userName: r.user_name,
        rating: Number(r.rating),
        comment: r.comment || '',
        mediaUrls: r.media_urls || { images: [], videos: [], audios: [] },
        createdAt: new Date(r.created_at),
      })));
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const uploadFileToStorage = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to 'reviews' bucket
    const { error } = await supabase.storage
      .from('reviews')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    // Get public URL
    const { data } = supabase.storage.from('reviews').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must sign in to leave a review.');
      return;
    }

    setUploading(true);
    try {
      const mediaUrls = {
        images: [] as string[],
        videos: [] as string[],
        audios: [] as string[],
      };

      // 1. Upload files directly to Supabase Storage if selected
      if (selectedImage) {
        const url = await uploadFileToStorage(selectedImage, 'images');
        mediaUrls.images.push(url);
      }
      if (selectedVideo) {
        const url = await uploadFileToStorage(selectedVideo, 'videos');
        mediaUrls.videos.push(url);
      }
      if (selectedAudio) {
        const url = await uploadFileToStorage(selectedAudio, 'audio');
        mediaUrls.audios.push(url);
      }

      // 2. Insert review record in DB
      const { error } = await supabase.from('reviews').insert({
        product_id: product.id,
        user_id: user.uid,
        user_name: user.displayName || 'Anonymous customer',
        rating: rating,
        comment: comment,
        media_urls: mediaUrls,
      });

      if (error) throw error;

      // 3. Recalculate average rating for the product and update products table
      const { data: allReviews, error: getReviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', product.id);

      if (!getReviewsError && allReviews) {
        const count = allReviews.length;
        const totalRating = allReviews.reduce((sum, r) => sum + Number(r.rating), 0);
        const newRating = Number((totalRating / count).toFixed(1));

        await supabase
          .from('products')
          .update({ rating: newRating, review_count: count })
          .eq('id', product.id);
      }

      toast.success('Thank you for your feedback! Review posted.');
      setComment('');
      setRating(5);
      setSelectedImage(null);
      setSelectedVideo(null);
      setSelectedAudio(null);

      fetchReviews();
      onReviewSubmitted();
    } catch (err: any) {
      console.error('Error posting review:', err);
      toast.error(err.message || 'Failed to submit review.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-16 border-t pt-12" style={{ borderColor: 'var(--border)' }}>
      <h2 className="font-display font-bold text-2xl mb-8" style={{ color: 'var(--text-primary)' }}>
        Customer Feedback
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {loadingReviews ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="skeleton h-24 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="card p-10 text-center" style={{ color: 'var(--text-secondary)' }}>
              <p className="text-4xl mb-3">🫙</p>
              <p className="text-sm">Be the first to review this product!</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="card p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.userName}</h4>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {r.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={14}
                        className={i < r.rating ? 'text-ochre' : 'text-gray-600'}
                        fill={i < r.rating ? '#E5A93C' : 'none'}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>

                {/* Media Playback & Views */}
                {(r.mediaUrls.images.length > 0 || r.mediaUrls.videos.length > 0 || r.mediaUrls.audios.length > 0) && (
                  <div className="flex flex-wrap gap-4 pt-2">
                    {r.mediaUrls.images.map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={img}
                        alt="Customer unboxing"
                        className="w-20 h-20 object-cover rounded-xl border border-white/10 hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                    {r.mediaUrls.videos.map((vid, i) => (
                      <video
                        key={i}
                        src={vid}
                        controls
                        className="w-48 h-28 object-cover rounded-xl border border-white/10"
                      />
                    ))}
                    {r.mediaUrls.audios.map((aud, i) => (
                      <audio key={i} src={aud} controls className="w-full max-w-xs scale-90" />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Submit Form */}
        <div className="lg:col-span-1">
          {user ? (
            <form onSubmit={handleSubmitReview} className="card p-6 space-y-4 sticky top-24">
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Write a Review
              </h3>

              {/* Star Selection */}
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Overall Rating
                </span>
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => {
                    const ratingValue = i + 1;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setRating(ratingValue)}
                        onMouseEnter={() => setHoveredRating(ratingValue)}
                        onMouseLeave={() => setHoveredRating(null)}
                        className="p-1 -ml-1 text-2xl transition-colors outline-none"
                      >
                        <FiStar
                          className={ratingValue <= (hoveredRating ?? rating) ? 'text-ochre' : 'text-gray-600'}
                          fill={ratingValue <= (hoveredRating ?? rating) ? '#E5A93C' : 'none'}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment Input */}
              <div>
                <label htmlFor="review-comment" className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Tasting Notes & Comment
                </label>
                <textarea
                  id="review-comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe the aroma, texture, and taste..."
                  required
                  className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-ochre bg-transparent resize-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Flavor Slider Detail */}
              <div className="p-3 bg-white/3 rounded-xl border border-white/5 space-y-2">
                <span className="text-xs font-semibold text-ochre uppercase tracking-wider">
                  Flavor Characteristics
                </span>
                <div className="flex justify-between items-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span>{product.category === 'pickles' ? 'Spiciness Intensity:' : 'Sweetness Profile:'}</span>
                  <span className="font-bold text-cream">{product.heatLevel} / 10</span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-ochre h-full" style={{ width: `${product.heatLevel * 10}%` }} />
                </div>
              </div>

              {/* Direct Media Uploads */}
              <div className="space-y-3">
                <span className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Add Unboxing Media
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {/* Image input */}
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs gap-1 transition-all ${
                      selectedImage ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-dashed hover:border-ochre/60 text-gray-400'
                    }`}
                    style={{ borderColor: selectedImage ? undefined : 'var(--border)' }}
                  >
                    {selectedImage ? <FiCheck size={16} /> : <FiImage size={16} />}
                    <span>Photo</span>
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />

                  {/* Video input */}
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs gap-1 transition-all ${
                      selectedVideo ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-dashed hover:border-ochre/60 text-gray-400'
                    }`}
                    style={{ borderColor: selectedVideo ? undefined : 'var(--border)' }}
                  >
                    {selectedVideo ? <FiCheck size={16} /> : <FiVideo size={16} />}
                    <span>Video</span>
                  </button>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4"
                    onChange={(e) => setSelectedVideo(e.target.files?.[0] || null)}
                    className="hidden"
                  />

                  {/* Audio input */}
                  <button
                    type="button"
                    onClick={() => audioInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-xs gap-1 transition-all ${
                      selectedAudio ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-dashed hover:border-ochre/60 text-gray-400'
                    }`}
                    style={{ borderColor: selectedAudio ? undefined : 'var(--border)' }}
                  >
                    {selectedAudio ? <FiCheck size={16} /> : <FiMic size={16} />}
                    <span>Voice</span>
                  </button>
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/mp3,audio/wav"
                    onChange={(e) => setSelectedAudio(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
              </div>

              <button
                id="submit-review-btn"
                type="submit"
                disabled={uploading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <FiLoader className="animate-spin" size={16} />
                    <span>Uploading Media & Posting…</span>
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="card p-6 text-center space-y-3 sticky top-24">
              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Share Your Opinion
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                You must sign in to leave unboxing feedback, voice reviews, and photos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
