import Swal from 'sweetalert2';
import { ActionDelete, ActionEdit, ActionView } from 'components/action';
import { Button } from 'components/button';
import { LabelStatus } from 'components/label';
import { Table } from 'components/table';
import { db } from 'firebase-app/firebase-config';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import DashboardHeading from 'module/dashboard/DashboardHeading';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryStatus, userRole } from 'utils/constants';
import { debounce } from 'lodash';
import { useAuth } from 'contexts/auth-context';
const CATEGORY_PER_PAGE = 2;

const CategoryManage = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [categoryList, setCategoryList] = useState([]);
  const [total, setTotal] = useState(0);
  const [lastDoc, setLastDoc] = useState('');
  const [filter, setFilter] = useState('');

  //LOAD MORE
  const handleLoadMoreCategory = async () => {
    const nextRef = query(
      collection(db, 'categories'),
      startAfter(lastDoc || 0),
      limit(CATEGORY_PER_PAGE)
    );

    onSnapshot(nextRef, snapshot => {
      let results = [];
      snapshot.forEach(doc => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setCategoryList([...categoryList, ...results]);
    });
    const documentSnapshots = await getDocs(nextRef);
    const lastVisible =
      documentSnapshots.docs[documentSnapshots.docs.length - 1];
    setLastDoc(lastVisible);
  };
  useEffect(() => {
    async function fetchData() {
      const colRef = collection(db, 'categories');
      const newRef = filter
        ? query(
            colRef,
            where('name', '>=', filter),
            where('name', '<=', filter + 'utf8')
          )
        : query(colRef, limit(CATEGORY_PER_PAGE));
      const documentSnapshots = await getDocs(newRef);
      const lastVisible =
        documentSnapshots.docs[documentSnapshots.docs.length - 1];

      onSnapshot(colRef, snapshot => {
        setTotal(snapshot.size);
      });

      onSnapshot(newRef, snapshot => {
        let results = [];
        snapshot.forEach(doc => {
          results.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setCategoryList(results);
      });
      setLastDoc(lastVisible);
    }
    fetchData();
  }, [filter]);

  //
  const handleDeleteCategory = docId => {
    const singleDoc = doc(db, 'categories', docId);
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async result => {
      if (result.isConfirmed) {
        await deleteDoc(singleDoc);
        Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
      }
    });
  };

  //Sử dụng debounce Lodash để không bị re-render nhiều lần vì dùng onchange
  const handleInputFilter = debounce(e => {
    setFilter(e.target.value);
  }, 500);
  return (
    <div>
      <DashboardHeading title="Categories" desc="Manage your category">
        <Button kind="ghost" height="60px" to="/manage/add-category">
          Create Category
        </Button>
      </DashboardHeading>
      <div className="flex justify-end mb-10">
        <input
          type="text"
          placeholder="Search category..."
          className="px-5 py-4 border border-gray-300 rounded-lg outline-none"
          onChange={handleInputFilter}
        />
      </div>
      <Table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categoryList?.length > 0 &&
            categoryList.map(category => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>
                  <span className="italic text-gray-400">{category.slug}</span>
                </td>
                <td>
                  {Number(category.status) === categoryStatus.APPROVED && (
                    <LabelStatus type="success">Approved</LabelStatus>
                  )}
                  {Number(category.status) === categoryStatus.UNAPPROVED && (
                    <LabelStatus type="warning">Unapproved</LabelStatus>
                  )}
                </td>
                <td>
                  <div className="flex items-center text-gray-500 gap-x-3">
                    <ActionView
                      onClick={() =>
                        navigate(`/category/${category.slug}`)
                      }></ActionView>
                    {userInfo.role !== userRole.ADMIN ? (
                      ''
                    ) : (
                      <>
                        {' '}
                        <ActionEdit
                          onClick={() =>
                            navigate(
                              `/manage/update-category?id=${category.id}`
                            )
                          }></ActionEdit>
                        <ActionDelete
                          onClick={() =>
                            handleDeleteCategory(category.id)
                          }></ActionDelete>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      <div className="mt-10">
        {/* CHECK HẾT DATA THÌ ẨN LOAD MORE */}
        {total > categoryList.length && (
          <div className="mt-10">
            <Button onClick={handleLoadMoreCategory} className="mx-auto">
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManage;