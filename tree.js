KISSY.use("tree",function(S,Tree){
    var FIRSTLEVEL=-1,$ = S.all,CheckNode = Tree.CheckNode;
    //构建一级类目
    function getFirstList(data){
        var listArray=[];
        for(var i in data){
            if(+data[i].parentId===FIRSTLEVEL){
                listArray.push({name:data[i].name,id:data[i].catId,parentId:data[i].parentId,children:data[i].children?data[i].children:[]});
            }
        }
        return listArray;
    }
    //查找一级类目的子类目
    function getChildrenList(id,listdata){
        var listData=listdata.concat(''),childrenListArray=[];
        if(listData.length>0){
            for(var i=0;i<listData.length;i++){
                if(+listData[i].parentId==id){
                    childrenListArray.push({content:listData[i].name,id:listData[i].catId,parentId:listData[i].parentId});
                }
            }
        }
        return childrenListArray;
    }
	//组装新的一级类目的子类目,cateData:一级类目的对象
    function makeChildrenList(catData){
        var catChildrenArray=catData.children?catData.children:[],childrenList=[];
        if(catChildrenArray.length>0){
            for(var i=0;i<catChildrenArray.length;i++){
                childrenList.push({content:catChildrenArray[i].name,id:catChildrenArray[i].catId,parentId:catChildrenArray[i].parentId?catChildrenArray[i].parentId:catData.catId})
            }
        }
        return childrenList;
    }
    //构建tree的数据内容
    function getTreeContent(data){
        var treeContentArray=[],firstList=getFirstList(data);
        
        if(firstList.length>0){
            for(var i=0;i<firstList.length;i++){
                var firstId=firstList[i].id,firstName=firstList[i].name;
                if(firstId&&firstName){
                    treeContentArray.push({
                        content:firstName,
                        id:firstId,
                        parentId:firstList[i].parentId,
                        children:makeChildrenList(firstList[i])
                    });
                }
            }
        }
        return treeContentArray;
    }

    function getNode(node, content) {
        if (node.content == content) {
            return node;
        }
        var c = node.children || [];
        for (var i = 0; i < c.length; i++) {
            var t = getNode(c[i], content);
            if (t) {
                return t;
            }
        }
        return null;
    }

    //构建json数据树
    function createJsonTreeList(data){
        var treeArray=[],treeContainerTpl='<li class="tree-list"><div id="" class="tree-con" style="width: 200px;"></div></li>';
        
        var treeContent=getTreeContent(data);
        if(treeContent.length>0){
            var listContainer=S.one('.tree-container');
            for(var i in treeContent){
                var treeContainer=S.DOM.create(treeContainerTpl);
                listContainer.append(treeContainer);
                S.one(treeContainer).attr('id','treeContainer'+i);
                var tree=new Tree.CheckTree({
                    content:treeContent[i].content,
                    isLeaf:false,
                    render:'#treeContainer'+i
                });
                tree.set('id',treeContent[i].id);
                tree.set('parentId',treeContent[i].parentId);
                tree.render();
                treeArray.push(tree);
            }
        }
        return treeArray;
    }

    function initTree(data){
        var treeList=createJsonTreeList(data),treeContent=getTreeContent(data);
        
        S.each(treeList,function(item,index){
            item.on('expand',function(e){
                var node = e.target;
                if (!node.get("children").length) {
                    var c = getNode(treeContent[index], node.get("content")).children;
                    S.each(c, function (v,nindex) {
                        var treeNode=new Tree.CheckNode({
                            checkState:node.get("checkState") == CheckNode.CHECK ? CheckNode.CHECK : CheckNode.EMPTY,
                            isLeaf:!(v.children && v.children.length),
                            content:v.content
                        });
                        treeNode.set('id',v.id);
                        treeNode.set('parentId',v.parentId);
                        
                        node.addChild(treeNode);                                    
                    });
                }
            });
            item.on('click',function(e){
                //取消其他类目的选中状态
                S.each(treeList,function(nitem){
                    if(nitem!=item){
                        nitem.set("checkState",CheckNode.EMPTY);
                    }
                });
                
                if(+e.target.get('parentId')!=FIRSTLEVEL){
                    var siblings=item.get('tree').get('children');
                    S.each(siblings,function(v){
                        if(v!=e.target){
                            v.set('checkState',CheckNode.EMPTY);
                        }
                    });
                    S.one('.J_FirCatId').val(item.get('id'));
                    S.one('.J_FirCatName').val(item.get('content'));
                    S.one('.J_SecCatId').val(e.target.get('id'));
                    S.one('.J_SecCatName').val(e.target.get('content'));
                }else{
                    S.one('.J_FirCatId').val(item.get('id'));
                    S.one('.J_FirCatName').val(item.get('content'));
                    S.one('.J_SecCatId').val('');
                    S.one('.J_SecCatName').val('');
                }
                if(item.get('checkState')==CheckNode.EMPTY){
                    S.one('.J_FirCatId').val('');
                    S.one('.J_FirCatName').val('');
                    S.one('.J_SecCatId').val('');
                    S.one('.J_SecCatName').val('');
                   
                }
                
            });
            
        })
    }
    initTree(jsonData.defaultModel);
});