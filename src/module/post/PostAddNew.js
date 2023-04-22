import { Button } from 'components/button';
import { Checkbox, Radio } from 'components/checkbox';
import { Dropdown } from 'components/dropdown';
import { Field } from 'components/field';
import { Input } from 'components/input';
import { Label } from 'components/label';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import slugify from 'slugify';
import styled from 'styled-components';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { postStatus } from 'utils/constants';
import ImageUpload from 'components/image/ImageUpload';
import { collection } from 'firebase/firestore';
import { db } from 'firebase-app/firebase-config';
import { toast } from 'react-toastify';
const PostAddNewStyles = styled.div``;

const PostAddNew = () => {
  //Lấy storage
  const storage = getStorage();

  //Kết nối đến collection posts
  const colRef = collection(db, 'posts');

  const { control, watch, setValue, handleSubmit, getValues } = useForm({
    mode: 'onChange',
    defaultValues: {
      title: '',
      slug: '',
      status: 2,
      image: '',
      category: {},
      user: {},
    },
  });

  //Theo giỏi sự thay đổi
  const watchStatus = watch('status');
  const watchCategory = watch('category');

  //Handle add new posts
  const addPostHandler = values => {
    const cloneValues = { ...values };
    cloneValues.slug = slugify(values.slug || values.title);
    cloneValues.status = Number(values.status);
    // handleUploadImage(cloneValues.image);
  };

  //Tạo state để handle progress chạy upload ảnh
  const [progress, setProgress] = useState(0);
  //State khi upload xong thì hiện ảnh lên chổ label input
  const [image, setImage] = useState('');

  //onSelect IMG
  const onSelectImage = e => {
    const file = e.target.files[0];
    if (!file) return;
    setValue('image_name', file.name);
    handleUploadImage(file);
  };

  //Delete images
  const handleDeleteImage = () => {
    const storage = getStorage();

    // Create a reference to the file to delete
    const imageRef = ref(storage, 'images/' + getValues('image_name'));

    // Delete the file
    deleteObject(imageRef)
      .then(() => {
        toast.success('Deleted successfully');
        setImage('');
        setProgress(0);
      })
      .catch(error => {
        toast.error('Failure to delete');
      });
  };

  //Handle Upload File Image
  const handleUploadImage = file => {
    const storage = getStorage();
    const metadata = {
      contentType: 'image/jpeg',
    };
    // Upload file to the object 'images/'
    const storageRef = ref(storage, 'images/' + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      'state_changed',
      snapshot => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progressPercent =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progressPercent);
        // console.log('Upload is ' + progressPercent + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
          default:
            console.log('Nothing at all');
        }
      },
      error => {
        console.log('Upload error: ' + error);
      },
      () => {
        // Upload completed successfully, now we can get the download URL and show image
        getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
          // console.log('File available at', downloadURL);
          toast.success('Upload successfully');
          setImage(downloadURL);
        });
      }
    );
  };

  return (
    <PostAddNewStyles>
      <h1 className="dashboard-heading">Add new post</h1>
      <form onSubmit={handleSubmit(addPostHandler)}>
        <div className="grid grid-cols-2 gap-x-10 mb-10">
          <Field>
            <Label>Title</Label>
            <Input
              control={control}
              placeholder="Enter your title"
              name="title"></Input>
          </Field>
          <Field>
            <Label>Slug</Label>
            <Input
              control={control}
              placeholder="Enter your slug"
              name="slug"></Input>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-x-10 mb-10">
          <Field>
            <Label>Image</Label>
            <ImageUpload
              onChange={onSelectImage}
              handleDeleteImage={handleDeleteImage}
              className="h-[250px] bg-gray-100"
              progress={progress}
              image={image}></ImageUpload>
          </Field>
          <Field>
            <Label>Status</Label>
            <div className="flex items-center gap-x-5">
              <Radio
                name="status"
                control={control}
                checked={Number(watchStatus) === postStatus.APPROVER}
                value={postStatus.APPROVER}>
                Approved
              </Radio>
              <Radio
                name="status"
                control={control}
                checked={Number(watchStatus) === postStatus.PENDING}
                value={postStatus.PENDING}>
                Pending
              </Radio>
              <Radio
                name="status"
                control={control}
                checked={Number(watchStatus) === postStatus.REJECTED}
                value={postStatus.REJECTED}>
                Reject
              </Radio>
            </div>
          </Field>
          <Field>
            <Label>Author</Label>
            <Input control={control} placeholder="Find the author"></Input>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-x-10 mb-10">
          <Field>
            <Label>Category</Label>
            <Dropdown>
              <Dropdown.Option>Knowledge</Dropdown.Option>
              <Dropdown.Option>Blockchain</Dropdown.Option>
              <Dropdown.Option>Setup</Dropdown.Option>
              <Dropdown.Option>Nature</Dropdown.Option>
              <Dropdown.Option>Developer</Dropdown.Option>
            </Dropdown>
          </Field>
          <Field></Field>
        </div>
        <Button type="submit" className="mx-auto">
          Add new post
        </Button>
      </form>
    </PostAddNewStyles>
  );
};

export default PostAddNew;
