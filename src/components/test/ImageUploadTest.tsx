'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ImageUploadTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');
  
  const supabase = createClient();

  const testUpload = async () => {
    if (!selectedFile) {
      setResult('No file selected');
      return;
    }

    setUploading(true);
    setResult('Starting upload...');

    try {
      // Test file upload
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `test-${Date.now()}.${fileExt}`;
      
      console.log('Uploading to product-images bucket:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setResult(`Upload failed: ${uploadError.message}`);
        return;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // Test database insert
      const testProduct = {
        name: 'Test T-Shirt Upload',
        description: 'Testing image upload functionality',
        price: 25.99,
        category: 'tshirts',
        stock: 10,
        image_url: publicUrl,
        image_urls: [publicUrl]
      };

      const { data: dbData, error: dbError } = await supabase
        .from('products')
        .insert([testProduct])
        .select();

      if (dbError) {
        console.error('DB error:', dbError);
        setResult(`Database error: ${dbError.message}`);
        return;
      }

      console.log('Database insert successful:', dbData);
      setResult(`Success! Image uploaded: ${publicUrl}\nProduct created with ID: ${dbData[0]?.id}`);

    } catch (error) {
      console.error('Unexpected error:', error);
      setResult(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Image Upload Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <Button 
          onClick={testUpload} 
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? 'Testing...' : 'Test Upload'}
        </Button>
        
        {result && (
          <div className="p-3 bg-gray-100 rounded text-sm whitespace-pre-wrap">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
}